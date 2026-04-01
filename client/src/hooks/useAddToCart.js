"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";
import { addGuestItem, setCartItems } from "@/store/slices/cartSlice";

const mapServerCartItems = (items = []) => {
  return items.map((item) => ({
    product_id: Number(item.product_id),
    name: item.name || "",
    price: Number(item.price || 0),
    image: item.image || null,
    quantity: Number(item.quantity || 0),
  }));
};

const useAddToCart = () => {
  const [isAdding, setIsAdding] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state) => state.auth?.isAuthenticated === true,
  );

  const addToCart = async (product, quantity = 1) => {
    const productId = Number(product?.product_id);

    if (!productId) {
      toast.error("Invalid product");
      return false;
    }

    try {
      setIsAdding(true);

      let useServerCart = isAuthenticated;

      // Redux auth can be false after refresh even when cookie session is valid.
      if (!useServerCart) {
        const currentUser = await authService.getCurrentUser();
        useServerCart = Boolean(currentUser);
      }

      if (useServerCart) {
        await cartService.addItem(productId, quantity);
        const latestCart = await cartService.getCart();
        dispatch(setCartItems(mapServerCartItems(latestCart?.items || [])));
      } else {
        dispatch(
          addGuestItem({
            product,
            quantity,
          }),
        );
      }

      toast.success("Item added to cart");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to add item to cart");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    isAdding,
    addToCart,
  };
};

export default useAddToCart;
