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
      const nextError = new Error(
        getApiErrorMessage(error, "Failed to create appointment"),
      );
      nextError.status = error.response?.status;
      throw nextError;
    }
  },

  async getDoctorBookedSlots(doctorUserId, date) {
    try {
      const response = await api.get(
        `/appointments/doctor/${doctorUserId}/booked-slots`,
        {
          params: { date },
        },
      );

      return response.data?.data?.booked_slots ?? [];
    } catch (error) {
      const nextError = new Error(
        getApiErrorMessage(error, "Failed to load booked slots"),
      );
      nextError.status = error.response?.status;
      throw nextError;
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

  async getAppointmentById(appointmentId) {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load appointment details"),
      );
    }
  },

  async confirmAppointment(appointmentId, payload) {
    try {
      const response = await api.patch(
        `/appointments/${appointmentId}/confirm`,
        payload,
      );
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to confirm appointment"),
      );
    }
  },

  async rejectAppointment(appointmentId, payload) {
    try {
      const response = await api.patch(
        `/appointments/${appointmentId}/reject`,
        payload,
      );
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to reject appointment"),
      );
    }
  },

  async completeAppointment(appointmentId, payload) {
    try {
      const response = await api.patch(
        `/appointments/${appointmentId}/complete`,
        payload,
      );
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to complete appointment"),
      );
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
