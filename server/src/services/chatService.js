import { Op } from "sequelize";
import appointmentModel from "../models/appointmentModel.js";
import chatMessageModel from "../models/chatMessageModel.js";
import userModel from "../models/userModel.js";

class ChatService {
  async getConfirmedAppointmentForUser(userId, appointmentId) {
    const appointment = await appointmentModel.findByPk(appointmentId, {
      include: [
        {
          model: userModel,
          as: "patient",
          attributes: ["user_id", "full_name", "role"],
        },
        {
          model: userModel,
          as: "doctor",
          attributes: ["user_id", "full_name", "role"],
        },
      ],
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.status !== "confirmed") {
      throw new Error("Chat is available only for confirmed appointments");
    }

    const isParticipant =
      Number(appointment.patient_user_id) === Number(userId) ||
      Number(appointment.doctor_user_id) === Number(userId);

    if (!isParticipant) {
      throw new Error("You are not allowed to access this chat");
    }

    return appointment;
  }

  async getMessages(userId, appointmentId) {
    await this.getConfirmedAppointmentForUser(userId, appointmentId);

    const messages = await chatMessageModel.findAll({
      where: { appointment_id: appointmentId },
      include: [
        {
          model: userModel,
          as: "sender",
          attributes: ["user_id", "full_name", "role"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return messages;
  }

  async sendMessage(userId, appointmentId, payload) {
    const { message } = payload;

    const appointment = await this.getConfirmedAppointmentForUser(
      userId,
      appointmentId,
    );

    const senderId = Number(userId);
    const receiverId =
      senderId === Number(appointment.patient_user_id)
        ? Number(appointment.doctor_user_id)
        : Number(appointment.patient_user_id);

    const newMessage = await chatMessageModel.create({
      appointment_id: Number(appointmentId),
      sender_user_id: senderId,
      receiver_user_id: receiverId,
      message,
    });

    return await chatMessageModel.findByPk(newMessage.message_id, {
      include: [
        {
          model: userModel,
          as: "sender",
          attributes: ["user_id", "full_name", "role"],
        },
      ],
    });
  }

  async markMessagesAsRead(userId, appointmentId) {
    await this.getConfirmedAppointmentForUser(userId, appointmentId);

    const [updatedCount] = await chatMessageModel.update(
      { is_read: true },
      {
        where: {
          appointment_id: Number(appointmentId),
          receiver_user_id: Number(userId),
          is_read: false,
          sender_user_id: {
            [Op.ne]: Number(userId),
          },
        },
      },
    );

    return {
      updated_count: updatedCount,
    };
  }
}

export default new ChatService();
