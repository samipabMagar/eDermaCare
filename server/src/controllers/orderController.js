import orderService from "../services/orderService.js";

class OrderController {
  async checkout(req, res) {
    try {
      const userId = req.user.id;
      const order = await orderService.checkoutFromCart(userId, req.body);

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create order",
      });
    }
  }

  async getMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await orderService.getMyOrders(userId, req.query);

      return res.status(200).json({
        success: true,
        message:
          orders.length > 0
            ? "Orders retrieved successfully"
            : "No orders found",
        data: orders,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve orders",
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const orderId = req.params.orderId;
      const currentUserId = req.user.id;
      const currentUserRole = req.user.role;

      const order = await orderService.getOrderById(
        currentUserId,
        currentUserRole,
        orderId,
      );

      return res.status(200).json({
        success: true,
        message: "Order retrieved successfully",
        data: order,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve order",
      });
    }
  }

  async cancelOrder(req, res) {
      try {
        const orderId = req.params.orderId;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;
  
        const order = await orderService.cancelOrder(
          currentUserId,
          currentUserRole,
          orderId,
          req.body,
        );
  
        return res.status(200).json({
          success: true,
          message: "Order cancelled successfully",
          data: order,
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "Failed to cancel order",
        });
      }
    }
}

export default new OrderController();
