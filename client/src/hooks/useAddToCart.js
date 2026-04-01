"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { cartService } from "@/services/cartService";

const useAddToCart = () => {
  const [isAdding, setIsAdding] = useState(false);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setIsAdding(true);
      await cartService.addItem(productId, quantity);
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
