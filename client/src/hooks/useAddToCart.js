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
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const addToCart = async (product, quantity = 1) => {
    const productId = Number(product?.product_id);

    if (!productId) {
      toast.error("Invalid product");
      return false;
    }

    try {
      setIsAdding(true);

      // Resolve auth from live session so stale Redux state after logout doesn't hit protected cart APIs.
      const currentUser = await authService.getCurrentUser();
      const useServerCart = Boolean(currentUser) || isAuthenticated === true;

      if (useServerCart) {
        try {
          await cartService.addItem(productId, quantity);
          const latestCart = await cartService.getCart();
          dispatch(setCartItems(mapServerCartItems(latestCart?.items || [])));
        } catch (serverError) {
          const message = serverError?.message || "";
          const isAuthError =
            message.toLowerCase().includes("logged in") ||
            message.toLowerCase().includes("unauthorized") ||
            message.toLowerCase().includes("forbidden");

          if (!isAuthError) {
            throw serverError;
          }

          dispatch(
            addGuestItem({
              product,
              quantity,
            }),
          );
        }
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
