class CartController {
  async getCart(req, res) {
    return res.status(501).json({
      success: false,
      message: "Get cart not implemented yet",
    });
  }

  async addItem(req, res) {
    return res.status(501).json({
      success: false,
      message: "Add cart item not implemented yet",
    });
  }

  async updateItem(req, res) {
    return res.status(501).json({
      success: false,
      message: "Update cart item not implemented yet",
    });
  }

  async removeItem(req, res) {
    return res.status(501).json({
      success: false,
      message: "Remove cart item not implemented yet",
    });
  }

  async clearCart(req, res) {
    return res.status(501).json({
      success: false,
      message: "Clear cart not implemented yet",
    });
  }
}

export default new CartController();
