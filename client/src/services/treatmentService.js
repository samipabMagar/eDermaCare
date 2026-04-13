import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const treatmentService = {
  async getTreatments() {
    try {
      const response = await api.get("/treatments");
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load treatments"));
    }
  },

  async createTreatmentBooking(payload) {
    try {
      const response = await api.post("/treatments/bookings", payload);
      return response.data?.data ?? null;
    } catch (error) {
      const err = new Error(
        getApiErrorMessage(error, "Failed to create treatment booking"),
      );
      err.status = error.response?.status;
      throw err;
    }
  },
};
