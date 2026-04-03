import paymentService from "../services/paymentService.js";

class PaymentController {
  async initiateKhalti(req, res) {
    try {
      const orderId = req.params.orderId;
      const currentUserId = req.user.id;
      const currentUserRole = req.user.role;

      const result = await paymentService.initiateKhaltiPayment({
        orderId,
        currentUserId,
        currentUserRole,
        returnUrl: req.body.return_url,
      });

      return res.status(200).json({
        success: true,
        message: "Khalti payment initiated successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to initiate Khalti payment",
      });
    }
  }
}

export default new PaymentController();
