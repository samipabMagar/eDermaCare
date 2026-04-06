import { Op } from "sequelize";
import connection from "../configs/db.js";
import cartModel from "../models/cartModel.js";
import cartItemModel from "../models/cartItemModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import orderItemModel from "../models/orderItemModel.js";

const ORDER_STATUSES = new Set([
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);

class OrderService {
  toFixedAmount(value) {
    return Number(value || 0).toFixed(2);
  }

  generateOrderNumber() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
  }

  formatOrder(order) {
    const items = (order.items || []).map((item) => ({
      order_item_id: item.order_item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      unit_price: this.toFixedAmount(item.unit_price),
      quantity: Number(item.quantity),
      line_total: this.toFixedAmount(item.line_total),
    }));

    return {
      order_id: order.order_id,
      order_number: order.order_number,
      user_id: order.user_id,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      currency: order.currency,
      shipping_address: order.shipping_address,
      contact_phone: order.contact_phone,
      notes: order.notes,
      cancel_reason: order.cancel_reason,
      cancelled_at: order.cancelled_at,
      paid_at: order.paid_at,
      summary: {
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: this.toFixedAmount(order.subtotal),
        discount: this.toFixedAmount(order.discount),
        tax: this.toFixedAmount(order.tax),
        shipping_fee: this.toFixedAmount(order.shipping_fee),
        grand_total: this.toFixedAmount(order.grand_total),
      },
      items,
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  async checkoutFromCart(userId, payload) {
    return await connection.transaction(async (transaction) => {
      const cart = await cartModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: cartItemModel,
            as: "items",
            include: [
              {
                model: productModel,
                as: "product",
                attributes: [
                  "product_id",
                  "name",
                  "price",
                  "stock_quantity",
                  "is_active",
                  "images",
                ],
              },
            ],
          },
        ],
        transaction,
      });

      const items = cart?.items || [];

      if (items.length === 0) {
        throw new Error("Cannot checkout with an empty cart");
      }

      let subtotalValue = 0;
      const orderItemsPayload = [];

      for (const item of items) {
        const product = item.product;

        if (!product) {
          throw new Error("A product in your cart is no longer available");
        }

        if (!product.is_active) {
          throw new Error(`${product.name} is currently unavailable`);
        }

        const quantity = Number(item.quantity);
        const stockQuantity = Number(product.stock_quantity);

        if (quantity > stockQuantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const unitPrice = Number(product.price || 0);
        const lineTotal = unitPrice * quantity;
        const images = Array.isArray(product.images) ? product.images : [];

        subtotalValue += lineTotal;

        orderItemsPayload.push({
          product_id: product.product_id,
          product_name: product.name,
          product_image: images[0] || null,
          unit_price: this.toFixedAmount(unitPrice),
          quantity,
          line_total: this.toFixedAmount(lineTotal),
        });
      }

      const discount = 0;
      const tax = 0;
      const shippingFee = 0;
      const grandTotal = subtotalValue - discount + tax + shippingFee;

      const order = await orderModel.create(
        {
          order_number: this.generateOrderNumber(),
          user_id: userId,
          status: "pending",
          payment_status:
            payload.payment_method === "cod" ? "pending" : "unpaid",
          payment_method: payload.payment_method,
          currency: "NPR",
          subtotal: this.toFixedAmount(subtotalValue),
          discount: this.toFixedAmount(discount),
          tax: this.toFixedAmount(tax),
          shipping_fee: this.toFixedAmount(shippingFee),
          grand_total: this.toFixedAmount(grandTotal),
          shipping_address: payload.shipping_address,
          contact_phone: payload.contact_phone || null,
          notes: payload.notes || null,
        },
        { transaction },
      );

      const orderItemsWithOrderId = orderItemsPayload.map((item) => ({
        ...item,
        order_id: order.order_id,
      }));

      await orderItemModel.bulkCreate(orderItemsWithOrderId, { transaction });

      for (const item of items) {
        await productModel.decrement("stock_quantity", {
          by: Number(item.quantity),
          where: { product_id: item.product_id },
          transaction,
        });
      }

      await cartItemModel.destroy({
        where: { cart_id: cart.cart_id },
        transaction,
      });

      const createdOrder = await orderModel.findByPk(order.order_id, {
        include: [
          {
            model: orderItemModel,
            as: "items",
          },
        ],
        transaction,
      });

      return this.formatOrder(createdOrder);
    });
  }

  async getMyOrders(userId, query = {}) {
    const whereClause = { user_id: userId };

    if (query.status && ORDER_STATUSES.has(query.status)) {
      whereClause.status = query.status;
    }

    const orders = await orderModel.findAll({
      where: whereClause,
      include: [
        {
          model: orderItemModel,
          as: "items",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return orders.map((order) => this.formatOrder(order));
  }

  async getOrderById(currentUserId, currentUserRole, orderId) {
    const order = await orderModel.findByPk(orderId, {
      include: [
        {
          model: orderItemModel,
          as: "items",
        },
      ],
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const isAdmin = currentUserRole === "admin";
    const isOwner = Number(order.user_id) === Number(currentUserId);

    if (!isAdmin && !isOwner) {
      throw new Error("You do not have permission to view this order");
    }

    return this.formatOrder(order);
  }

  async cancelOrder(currentUserId, currentUserRole, orderId, payload = {}) {
    return await connection.transaction(async (transaction) => {
      const order = await orderModel.findByPk(orderId, {
        include: [
          {
            model: orderItemModel,
            as: "items",
          },
        ],
        transaction,
      });

      if (!order) {
        throw new Error("Order not found");
      }

      const isAdmin = currentUserRole === "admin";
      const isOwner = Number(order.user_id) === Number(currentUserId);

      if (!isAdmin && !isOwner) {
        throw new Error("You do not have permission to cancel this order");
      }

      if (["cancelled", "delivered", "returned"].includes(order.status)) {
        throw new Error("This order cannot be cancelled");
      }

      await order.update(
        {
          status: "cancelled",
          cancel_reason: payload.reason || "Cancelled by user",
          cancelled_at: new Date(),
        },
        { transaction },
      );

      for (const item of order.items || []) {
        if (!item.product_id) {
          continue;
        }

        await productModel.increment("stock_quantity", {
          by: Number(item.quantity),
          where: { product_id: item.product_id },
          transaction,
        });
      }

      return this.formatOrder(order);
    });
  }

  async getAllOrdersForAdmin(query = {}) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (query.status && ORDER_STATUSES.has(query.status)) {
      whereClause.status = query.status;
    }

    if (query.payment_status) {
      whereClause.payment_status = query.payment_status;
    }

    if (query.user_id) {
      whereClause.user_id = Number(query.user_id);
    }

    if (query.search) {
      whereClause[Op.or] = [
        {
          order_number: {
            [Op.like]: `%${query.search}%`,
          },
        },
        {
          contact_phone: {
            [Op.like]: `%${query.search}%`,
          },
        },
      ];
    }

    const { rows, count } = await orderModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: orderItemModel,
          as: "items",
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return {
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
      orders: rows.map((order) => this.formatOrder(order)),
    };
  }

  async updateOrderStatus(orderId, status) {
    if (!ORDER_STATUSES.has(status)) {
      throw new Error("Invalid order status");
    }

    const order = await orderModel.findByPk(orderId, {
      include: [
        {
          model: orderItemModel,
          as: "items",
        },
      ],
    });

    if (!order) {
      throw new Error("Order not found");
    }

    await order.update({ status });

    return this.formatOrder(order);
  }
}

export default new OrderService();
