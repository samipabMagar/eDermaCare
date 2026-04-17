import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const contactService = {
  async submitContactMessage(payload) {
    try {
      const response = await api.post("/contact", payload);
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to send contact message"),
      );
    }
  },
};
