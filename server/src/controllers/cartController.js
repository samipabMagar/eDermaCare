import cartService from "../services/cartService.js";

class CartController {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCartByUserId(userId);

      return res.status(200).json({
        success: true,
        message: "Cart retrieved successfully",
        data: cart,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve cart",
      });
    }
  }

  async addItem(req, res) {
    try {
      const userId = req.user.id;
      const item = await cartService.addItem(userId, req.body);

      return res.status(201).json({
        success: true,
        message: "Item added to cart",
        data: item,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to add item to cart",
      });
    }
  }

  async updateItem(req, res) {
    try {
      const userId = req.user.id;
      const itemId = Number(req.params.itemId);

      const updatedItem = await cartService.updateItemQuantity(
        userId,
        itemId,
        req.body.quantity,
      );

      return res.status(200).json({
        success: true,
        message: "Cart item updated successfully",
        data: updatedItem,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update cart item",
      });
    }
  }

  async removeItem(req, res) {
    try {
      const userId = req.user.id;
      const itemId = Number(req.params.itemId);

      const result = await cartService.removeItem(userId, itemId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to remove cart item",
      });
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const result = await cartService.clearCart(userId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to clear cart",
      });
    }
  }
}

export default new CartController();
