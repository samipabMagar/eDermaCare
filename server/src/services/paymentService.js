import orderModel from "../models/orderModel.js";
import paymentModel from "../models/paymentModel.js";
import { createHmac } from "crypto";

const KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/";
const DEFAULT_ESEWA_BASE_URL =
  "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const DEFAULT_ESEWA_VERIFY_URL =
  "https://rc-epay.esewa.com.np/api/epay/transaction/status/";

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

  getAmountWithTwoDecimals(amount) {
    return Number(amount || 0).toFixed(2);
  }

  getEsewaConfig() {
    const merchantCode = process.env.ESEWA_MERCHANT_CODE;
    const secretKey = process.env.ESEWA_SECRET_KEY;
    const baseUrl = process.env.ESEWA_BASE_URL || DEFAULT_ESEWA_BASE_URL;
    const verifyUrl = process.env.ESEWA_VERIFY_URL || DEFAULT_ESEWA_VERIFY_URL;

    if (!merchantCode) {
      throw new Error("eSewa merchant code is missing in environment");
    }

    if (!secretKey) {
      throw new Error("eSewa secret key is missing in environment");
    }

    return {
      merchantCode,
      secretKey,
      baseUrl,
      verifyUrl,
    };
  }

  buildEsewaSignature({
    totalAmount,
    transactionUuid,
    productCode,
    secretKey,
  }) {
    const signedString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

    return createHmac("sha256", secretKey)
      .update(signedString)
      .digest("base64");
  }

  parseEsewaCallbackData(data) {
    try {
      const decoded = Buffer.from(String(data || ""), "base64").toString(
        "utf-8",
      );
      return JSON.parse(decoded);
    } catch {
      throw new Error("Invalid eSewa callback data");
    }
  }

  async verifyEsewaWithGateway({ productCode, totalAmount, transactionUuid }) {
    const { verifyUrl } = this.getEsewaConfig();
    const query = new URLSearchParams({
      product_code: String(productCode),
      total_amount: String(totalAmount),
      transaction_uuid: String(transactionUuid),
    });

    const response = await fetch(`${verifyUrl}?${query.toString()}`, {
      method: "GET",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error("eSewa verification request failed");
    }

    return payload;
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

  async initiateEsewaPayment({
    orderId,
    currentUserId,
    currentUserRole,
    successUrl,
    failureUrl,
  }) {
    const order = await this.getOrderForPayment(
      orderId,
      currentUserId,
      currentUserRole,
    );

    if (order.payment_method !== "esewa") {
      throw new Error("This order is not configured for eSewa payment");
    }

    if (order.payment_status === "paid") {
      throw new Error("This order is already paid");
    }

    if (["cancelled", "returned"].includes(order.status)) {
      throw new Error("Cannot initiate payment for this order");
    }

    const { merchantCode, secretKey, baseUrl } = this.getEsewaConfig();
    const websiteUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const finalSuccessUrl =
      successUrl ||
      process.env.ESEWA_SUCCESS_URL ||
      `${websiteUrl}/payment/esewa/success`;
    const finalFailureUrl =
      failureUrl ||
      process.env.ESEWA_FAILURE_URL ||
      `${websiteUrl}/payment/esewa/failure`;

    const totalAmount = this.getAmountWithTwoDecimals(order.grand_total);
    const transactionUuid = `${order.order_number}-${Date.now()}`;
    const signature = this.buildEsewaSignature({
      totalAmount,
      transactionUuid,
      productCode: merchantCode,
      secretKey,
    });

    const payment = await paymentModel.create({
      order_id: order.order_id,
      user_id: order.user_id,
      gateway: "esewa",
      status: "pending",
      amount: Number(order.grand_total || 0),
      currency: order.currency || "NPR",
      gateway_reference: transactionUuid,
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
      esewa: {
        gateway_url: baseUrl,
        form_fields: {
          amount: totalAmount,
          tax_amount: "0",
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: merchantCode,
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: `${finalSuccessUrl}?orderId=${encodeURIComponent(order.order_id)}`,
          failure_url: `${finalFailureUrl}?orderId=${encodeURIComponent(order.order_id)}`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature,
        },
      },
    };
  }

  async verifyEsewaPayment({ orderId, currentUserId, currentUserRole, data }) {
    const order = await this.getOrderForPayment(
      orderId,
      currentUserId,
      currentUserRole,
    );

    if (order.payment_method !== "esewa") {
      throw new Error("This order is not configured for eSewa payment");
    }

    const callbackData = this.parseEsewaCallbackData(data);

    const transactionUuid = String(callbackData.transaction_uuid || "").trim();
    const totalAmount = String(callbackData.total_amount || "").trim();
    const productCode = String(callbackData.product_code || "").trim();

    if (!transactionUuid || !totalAmount || !productCode) {
      throw new Error("Invalid eSewa callback payload");
    }

    const payment = await paymentModel.findOne({
      where: {
        order_id: order.order_id,
        gateway: "esewa",
        gateway_reference: transactionUuid,
      },
      order: [["created_at", "DESC"]],
    });

    if (!payment) {
      throw new Error("No initiated eSewa payment found for this order");
    }

    const verification = await this.verifyEsewaWithGateway({
      productCode,
      totalAmount,
      transactionUuid,
    });

    const verificationStatus = String(verification?.status || "").toUpperCase();
    const transactionCode = String(
      callbackData.transaction_code || verification?.transaction_code || "",
    ).trim();

    if (verificationStatus === "COMPLETE") {
      payment.status = "completed";
      payment.transaction_id = transactionCode || null;
      payment.gateway_response = verification;
      payment.completed_at = new Date();

      await payment.save();

      await order.update({
        payment_status: "paid",
        paid_at: new Date(),
      });
    } else {
      payment.status = "failed";
      payment.transaction_id = transactionCode || null;
      payment.gateway_response = verification;
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
      esewa: {
        transaction_uuid: transactionUuid,
        total_amount: totalAmount,
        transaction_code: transactionCode || null,
        status: verificationStatus,
      },
    };
  }
}

export default new PaymentService();
