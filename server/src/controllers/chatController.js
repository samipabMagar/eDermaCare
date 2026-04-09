import chatService from "../services/chatService.js";

class ChatController {
  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const { appointmentId } = req.params;

      const messages = await chatService.getMessages(userId, appointmentId);

      return res.status(200).json({
        success: true,
        message: "Chat messages retrieved successfully",
        data: messages,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve chat messages",
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { appointmentId } = req.params;

      const message = await chatService.sendMessage(
        userId,
        appointmentId,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to send message",
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { appointmentId } = req.params;

      const result = await chatService.markMessagesAsRead(
        userId,
        appointmentId,
      );

      return res.status(200).json({
        success: true,
        message: "Messages marked as read",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to mark messages as read",
      });
    }
  }
}

export default new ChatController();
