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
}

export default new OrderController();
