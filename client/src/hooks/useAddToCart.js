"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { cartService } from "@/services/cartService";
import { addGuestItem } from "@/store/slices/cartSlice";

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

      if (isAuthenticated) {
        await cartService.addItem(productId, quantity);
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
