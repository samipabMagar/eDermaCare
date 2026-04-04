import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const appointmentService = {
  async createAppointment(payload) {
    try {
      const response = await api.post("/appointments", payload);
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to create appointment"),
      );
    }
  },

  async getMyAppointments() {
    try {
      const response = await api.get("/appointments/my");
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load appointments"));
    }
  },

  async cancelAppointment(appointmentId, cancellationReason) {
    try {
      const payload = cancellationReason
        ? { cancellation_reason: cancellationReason }
        : {};
      const response = await api.patch(
        `/appointments/${appointmentId}/cancel`,
        payload,
      );
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to cancel appointment"),
      );
    }
  },
};
