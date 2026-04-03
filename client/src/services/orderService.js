import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const orderService = {
  async getMyOrders() {
    try {
      const response = await api.get("/orders/my");
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load orders"));
    }
  },

  async checkout(payload) {
    try {
      const response = await api.post("/orders/checkout", payload);
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to place order"));
    }
  },
};
