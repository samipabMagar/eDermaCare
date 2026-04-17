import contactService from "../services/contactService.js";

class ContactController {
  async submitContactForm(req, res) {
    try {
      const result = await contactService.submitContactMessage(req.body);

      return res.status(200).json({
        success: true,
        message: "Contact message sent successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to send contact message",
      });
    }
  }
}

export default new ContactController();
