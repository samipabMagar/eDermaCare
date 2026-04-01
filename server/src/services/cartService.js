import connection from "../configs/db.js";
import cartModel from "../models/cartModel.js";
import cartItemModel from "../models/cartItemModel.js";
import productModel from "../models/productModel.js";

class CartService {
  toFixedAmount(value) {
    return Number(value || 0).toFixed(2);
  }

  async getOrCreateCart(userId, transaction = undefined) {
    let cart = await cartModel.findOne({
      where: { user_id: userId },
      transaction,
    });

    if (!cart) {
      cart = await cartModel.create(
        {
          user_id: userId,
        },
        { transaction },
      );
    }

    return cart;
  }

  buildCartSummary(items = []) {
    const subtotalValue = items.reduce((sum, item) => {
      return sum + Number(item.line_total);
    }, 0);

    const itemCount = items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0,
    );

    return {
      item_count: itemCount,
      subtotal: this.toFixedAmount(subtotalValue),
      discount: "0.00",
      tax: "0.00",
      shipping_fee: "0.00",
      grand_total: this.toFixedAmount(subtotalValue),
    };
  }

  async getCartByUserId(userId) {
    const cart = await this.getOrCreateCart(userId);

    const cartWithItems = await cartModel.findByPk(cart.cart_id, {
      include: [
        {
          model: cartItemModel,
          as: "items",
          include: [
            {
              model: productModel,
              as: "product",
              attributes: [
                "product_id",
                "name",
                "price",
                "stock_quantity",
                "is_active",
                "images",
              ],
            },
          ],
          order: [["created_at", "DESC"]],
        },
      ],
    });

    const items = (cartWithItems.items || []).map((item) => {
      const unitPrice = Number(item.product?.price || 0);
      const quantity = Number(item.quantity || 0);
      const images = Array.isArray(item.product?.images)
        ? item.product.images
        : [];

      return {
        cart_item_id: item.cart_item_id,
        product_id: item.product_id,
        name: item.product?.name || null,
        price: this.toFixedAmount(unitPrice),
        quantity,
        line_total: this.toFixedAmount(unitPrice * quantity),
        stock_quantity: item.product?.stock_quantity ?? 0,
        is_active: Boolean(item.product?.is_active),
        image: images[0] || null,
      };
    });

    return {
      cart_id: cartWithItems.cart_id,
      user_id: cartWithItems.user_id,
      items,
      summary: this.buildCartSummary(items),
      updated_at: cartWithItems.updated_at,
    };
  }

  async addItem(userId, payload) {
    const { product_id, quantity } = payload;

    const product = await productModel.findByPk(product_id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.is_active) {
      throw new Error("Product is not available");
    }

    return await connection.transaction(async (transaction) => {
      const cart = await this.getOrCreateCart(userId, transaction);

      const existingItem = await cartItemModel.findOne({
        where: {
          cart_id: cart.cart_id,
          product_id,
        },
        transaction,
      });

      const targetQuantity = existingItem
        ? Number(existingItem.quantity) + Number(quantity)
        : Number(quantity);

      if (targetQuantity > Number(product.stock_quantity)) {
        throw new Error("Requested quantity exceeds available stock");
      }

      if (existingItem) {
        await existingItem.update(
          {
            quantity: targetQuantity,
          },
          { transaction },
        );

        return {
          cart_item_id: existingItem.cart_item_id,
          product_id: existingItem.product_id,
          quantity: existingItem.quantity,
        };
      }

      const newItem = await cartItemModel.create(
        {
          cart_id: cart.cart_id,
          product_id,
          quantity,
        },
        { transaction },
      );

      return {
        cart_item_id: newItem.cart_item_id,
        product_id: newItem.product_id,
        quantity: newItem.quantity,
      };
    });
  }

  async updateItemQuantity(userId, itemId, quantity) {
    const cartItem = await cartItemModel.findOne({
      where: {
        cart_item_id: itemId,
      },
      include: [
        {
          model: cartModel,
          as: "cart",
          where: {
            user_id: userId,
          },
          attributes: ["cart_id", "user_id"],
        },
      ],
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    const product = await productModel.findByPk(cartItem.product_id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.is_active) {
      throw new Error("Product is not available");
    }

    if (Number(quantity) > Number(product.stock_quantity)) {
      throw new Error("Requested quantity exceeds available stock");
    }

    await cartItem.update({ quantity });

    return {
      cart_item_id: cartItem.cart_item_id,
      quantity: cartItem.quantity,
    };
  }

  async removeItem(userId, itemId) {
    const cartItem = await cartItemModel.findOne({
      where: {
        cart_item_id: itemId,
      },
      include: [
        {
          model: cartModel,
          as: "cart",
          where: {
            user_id: userId,
          },
          attributes: ["cart_id", "user_id"],
        },
      ],
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    await cartItem.destroy();

    return { message: "Item removed from cart" };
  }

  async clearCart(userId) {
    const cart = await cartModel.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!cart) {
      return { message: "Cart cleared successfully" };
    }

    await cartItemModel.destroy({
      where: {
        cart_id: cart.cart_id,
      },
    });

    return { message: "Cart cleared successfully" };
  }
}

export default new CartService();
