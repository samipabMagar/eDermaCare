import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const treatmentService = {
  async getTreatments(filters = {}) {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.sort) params.sort = filters.sort;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await api.get("/treatments", { params });

      return {
        treatments: response.data?.data ?? [],
        pagination: response.data?.pagination ?? null,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load treatments"));
    }
  },

  async getTreatmentById(treatmentId) {
    try {
      const response = await api.get(`/treatments/${treatmentId}`);
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load treatment details"));
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

  async getMyTreatmentBookings(filters = {}) {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;

      const response = await api.get("/treatments/bookings/my", { params });
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load treatment bookings"),
      );
    }
  },
};
