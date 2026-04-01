const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addGuestItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const productId = Number(product?.product_id);

      if (!productId) return;

      const existingItem = state.items.find(
        (item) => Number(item.product_id) === productId,
      );

      if (existingItem) {
        existingItem.quantity += Number(quantity);
      } else {
        state.items.push({
          product_id: productId,
          name: product?.name || "",
          price: Number(product?.price || 0),
          image:
            Array.isArray(product?.images) && product.images.length > 0
              ? product.images[0]
              : null,
          quantity: Number(quantity),
        });
      }
    },

    updateGuestQty: (state, action) => {
      const { productId, quantity } = action.payload;
      const targetId = Number(productId);
      const nextQuantity = Number(quantity);

      const item = state.items.find(
        (cartItem) => Number(cartItem.product_id) === targetId,
      );

      if (!item) return;

      if (nextQuantity <= 0) {
        state.items = state.items.filter(
          (cartItem) => Number(cartItem.product_id) !== targetId,
        );
      } else {
        item.quantity = nextQuantity;
      }
    },

    removeGuestItem: (state, action) => {
      const targetId = Number(action.payload);
      state.items = state.items.filter(
        (cartItem) => Number(cartItem.product_id) !== targetId,
      );
    },

    clearGuestCart: (state) => {
      state.items = [];
    },
  },
});

export const { addGuestItem, updateGuestQty, removeGuestItem, clearGuestCart } =
  cartSlice.actions;

export default cartSlice.reducer;
