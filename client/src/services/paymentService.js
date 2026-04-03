import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const paymentService = {
  async initiateKhalti(orderId, returnUrl) {
    try {
      const payload = returnUrl ? { return_url: returnUrl } : {};
      const response = await api.post(
        `/payments/khalti/${orderId}/initiate`,
        payload,
      );
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to initiate Khalti payment"),
      );
    }
  },

  async verifyKhalti(orderId, pidx) {
    try {
      const response = await api.post(`/payments/khalti/${orderId}/verify`, {
        pidx,
      });
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to verify Khalti payment"),
      );
    }
  },
};
