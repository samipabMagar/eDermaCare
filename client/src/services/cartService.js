import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const cartService = {
  // GET /api/cart
  async getCart() {
    try {
      const response = await api.get("/cart");
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load cart"));
    }
  },

  // POST /api/cart/items
  async addItem(productId, quantity = 1) {
    try {
      const response = await api.post("/cart/items", {
        product_id: productId,
        quantity,
      });
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to add item to cart"));
    }
  },

  // PATCH /api/cart/items/:itemId
  async updateItem(itemId, quantity) {
    try {
      const response = await api.patch(`/cart/items/${itemId}`, { quantity });
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update cart item"));
    }
  },

  // DELETE /api/cart/items/:itemId
  async removeItem(itemId) {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to remove cart item"));
    }
  },

  // DELETE /api/cart
  async clearCart() {
    try {
      const response = await api.delete("/cart");
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to clear cart"));
    }
  },
};
