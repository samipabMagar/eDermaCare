import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const chatService = {
  async getMessages(appointmentId) {
    try {
      const response = await api.get(
        `/chat/appointments/${appointmentId}/messages`,
      );
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load chat messages"),
      );
    }
  },

  async markAsRead(appointmentId) {
    try {
      const response = await api.patch(
        `/chat/appointments/${appointmentId}/read`,
      );
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to mark messages as read"),
      );
    }
  },
};
