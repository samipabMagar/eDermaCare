import orderModel from "../models/orderModel.js";
import paymentModel from "../models/paymentModel.js";

const KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/";

class PaymentService {
  getKhaltiSecretKey() {
    const secretKey = process.env.KHALTI_SECRET_KEY;

    if (!secretKey) {
      throw new Error("Khalti secret key is missing in environment");
    }

    return secretKey;
  }

  async getOrderForPayment(orderId, currentUserId, currentUserRole) {
    const order = await orderModel.findByPk(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    const isAdmin = currentUserRole === "admin";
    const isOwner = Number(order.user_id) === Number(currentUserId);

    if (!isAdmin && !isOwner) {
      throw new Error(
        "You do not have permission to access this order payment",
      );
    }

    return order;
  }

  async callKhalti(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Key ${this.getKhaltiSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.detail || "Khalti request failed");
    }

    return data;
  }

  getAmountInPaisa(amount) {
    return Math.round(Number(amount || 0) * 100);
  }

  formatPayment(payment) {
    return {
      payment_id: payment.payment_id,
      gateway: payment.gateway,
      status: payment.status,
      amount: Number(payment.amount || 0).toFixed(2),
      currency: payment.currency,
      gateway_reference: payment.gateway_reference,
      transaction_id: payment.transaction_id,
      initiated_at: payment.initiated_at,
      completed_at: payment.completed_at,
      failed_at: payment.failed_at,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    };
  }

  async getOrderPaymentHistory({ orderId, currentUserId, currentUserRole }) {
    const order = await this.getOrderForPayment(
      orderId,
      currentUserId,
      currentUserRole,
    );

    const payments = await paymentModel.findAll({
      where: { order_id: order.order_id },
      order: [["created_at", "DESC"]],
    });

    return {
      order_id: order.order_id,
      order_number: order.order_number,
      order_payment_status: order.payment_status,
      order_payment_method: order.payment_method,
      payments: payments.map((payment) => this.formatPayment(payment)),
    };
  }

  async initiateKhaltiPayment({
    orderId,
    currentUserId,
    currentUserRole,
    returnUrl,
  }) {
    const order = await this.getOrderForPayment(
      orderId,
      currentUserId,
      currentUserRole,
    );

    if (order.payment_method !== "khalti") {
      throw new Error("This order is not configured for Khalti payment");
    }

    if (order.payment_status === "paid") {
      throw new Error("This order is already paid");
    }

    if (["cancelled", "returned"].includes(order.status)) {
      throw new Error("Cannot initiate payment for this order");
    }

    const websiteUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const finalReturnUrl =
      returnUrl ||
      process.env.KHALTI_RETURN_URL ||
      `${websiteUrl}/payment/khalti/return`;

    const initiatePayload = {
      return_url: finalReturnUrl,
      website_url: websiteUrl,
      amount: this.getAmountInPaisa(order.grand_total),
      purchase_order_id: String(order.order_id),
      purchase_order_name: order.order_number,
    };

    const khaltiResponse = await this.callKhalti(
      KHALTI_INITIATE_URL,
      initiatePayload,
    );

    const payment = await paymentModel.create({
      order_id: order.order_id,
      user_id: order.user_id,
      gateway: "khalti",
      status: "pending",
      amount: Number(order.grand_total || 0),
      currency: order.currency || "NPR",
      gateway_reference: khaltiResponse?.pidx || null,
      gateway_response: khaltiResponse,
      initiated_at: new Date(),
    });

    if (order.payment_status !== "pending") {
      await order.update({ payment_status: "pending" });
    }

    return {
      order_id: order.order_id,
      order_number: order.order_number,
      payment_status: "pending",
      payment: {
        payment_id: payment.payment_id,
        gateway: payment.gateway,
        status: payment.status,
        gateway_reference: payment.gateway_reference,
      },
      khalti: khaltiResponse,
    };
  }

  async verifyKhaltiPayment({ orderId, currentUserId, currentUserRole, pidx }) {
    const order = await this.getOrderForPayment(
      orderId,
      currentUserId,
      currentUserRole,
    );

    if (order.payment_method !== "khalti") {
      throw new Error("This order is not configured for Khalti payment");
    }

    const payment = await paymentModel.findOne({
      where: {
        order_id: order.order_id,
        gateway: "khalti",
        gateway_reference: pidx,
      },
      order: [["created_at", "DESC"]],
    });

    if (!payment) {
      throw new Error(
        "No initiated Khalti payment found for this order and pidx",
      );
    }

    const khaltiResponse = await this.callKhalti(KHALTI_LOOKUP_URL, { pidx });
    const khaltiStatus = (khaltiResponse.status || "").toLowerCase();

    if (khaltiStatus === "completed") {
      payment.status = "completed";
      payment.transaction_id =
        khaltiResponse?.transaction_id || khaltiResponse?.idx || null;
      payment.gateway_response = khaltiResponse;
      payment.completed_at = new Date();

      await payment.save();

      await order.update({
        payment_status: "paid",
        paid_at: new Date(),
      });
    } else if (["pending", "initiated"].includes(khaltiStatus)) {
      payment.status = "pending";
      payment.gateway_response = khaltiResponse;
      await payment.save();

      if (order.payment_status !== "pending") {
        await order.update({ payment_status: "pending" });
      }
    } else {
      payment.status = "failed";
      payment.gateway_response = khaltiResponse;
      payment.failed_at = new Date();
      await payment.save();

      await order.update({ payment_status: "failed" });
    }

    await order.reload();

    return {
      order_id: order.order_id,
      order_number: order.order_number,
      payment_status: order.payment_status,
      payment: {
        payment_id: payment.payment_id,
        gateway: payment.gateway,
        status: payment.status,
        gateway_reference: payment.gateway_reference,
        transaction_id: payment.transaction_id,
      },
      khalti: khaltiResponse,
    };
  }
}

export default new PaymentService();
