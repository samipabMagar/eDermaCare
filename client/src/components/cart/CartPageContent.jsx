"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";
import { PRODUCT_ROUTE } from "@/constants/routes";
import {
  clearGuestCart,
  removeGuestItem,
  setCartItems,
  updateGuestQty,
} from "@/store/slices/cartSlice";
import CartItemCard from "@/components/cart/CartItemCard";
import CartSummaryCard from "@/components/cart/CartSummaryCard";

const normalizeServerItems = (items = []) => {
  return items.map((item) => ({
    cart_item_id: Number(item.cart_item_id),
    product_id: Number(item.product_id),
    name: item.name || "",
    price: Number(item.price || 0),
    image: item.image || null,
    quantity: Number(item.quantity || 0),
  }));
};

const buildSummary = (items = []) => {
  const itemCount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const shippingFee = subtotal > 3000 ? 0 : 150;

  return {
    item_count: itemCount,
    subtotal,
    shipping_fee: shippingFee,
    grand_total: subtotal + shippingFee,
  };
};

const CartPageContent = () => {
  const dispatch = useDispatch();
  const reduxCartItems = useSelector((state) => state.cart?.items ?? []);

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(buildSummary([]));
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isServerMode, setIsServerMode] = useState(false);

  const syncFromServer = useCallback(async () => {
    const cart = await cartService.getCart();
    const normalizedItems = normalizeServerItems(cart?.items || []);
    dispatch(setCartItems(normalizedItems));
    setItems(normalizedItems);
    setSummary(cart?.summary || buildSummary(normalizedItems));
  }, [dispatch]);

  useEffect(() => {
    const initializeCart = async () => {
      try {
        setIsLoading(true);
        const user = await authService.getCurrentUser();

        if (user) {
          setIsServerMode(true);
          await syncFromServer();
        } else {
          setIsServerMode(false);
          setItems(reduxCartItems);
          setSummary(buildSummary(reduxCartItems));
        }
      } catch {
        setIsServerMode(false);
        setItems(reduxCartItems);
        setSummary(buildSummary(reduxCartItems));
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
  }, [syncFromServer]);

  useEffect(() => {
    if (!isServerMode) {
      setItems(reduxCartItems);
      setSummary(buildSummary(reduxCartItems));
    }
  }, [isServerMode, reduxCartItems]);

  const handleIncrease = async (item) => {
    try {
      setIsUpdating(true);
      if (isServerMode) {
        await cartService.updateItem(
          item.cart_item_id,
          Number(item.quantity) + 1,
        );
        await syncFromServer();
      } else {
        dispatch(
          updateGuestQty({
            productId: item.product_id,
            quantity: Number(item.quantity) + 1,
          }),
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrease = async (item) => {
    try {
      const nextQty = Number(item.quantity) - 1;
      if (nextQty < 1) return;

      setIsUpdating(true);
      if (isServerMode) {
        await cartService.updateItem(item.cart_item_id, nextQty);
        await syncFromServer();
      } else {
        dispatch(
          updateGuestQty({
            productId: item.product_id,
            quantity: nextQty,
          }),
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async (item) => {
    try {
      setIsUpdating(true);
      if (isServerMode) {
        await cartService.removeItem(item.cart_item_id);
        await syncFromServer();
      } else {
        dispatch(removeGuestItem(item.product_id));
      }
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error.message || "Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClear = async () => {
    try {
      setIsUpdating(true);
      if (isServerMode) {
        await cartService.clearCart();
        await syncFromServer();
      } else {
        dispatch(clearGuestCart());
      }
      toast.success("Cart cleared successfully");
    } catch (error) {
      toast.error(error.message || "Failed to clear cart");
    } finally {
      setIsUpdating(false);
    }
  };

  const hasItems = useMemo(() => items.length > 0, [items]);

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 lg:px-8">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading your cart...
          </div>
        ) : !hasItems ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <ShoppingBag className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-slate-800">
              Your cart is empty
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add some products to see them here.
            </p>
            <Link
              href={PRODUCT_ROUTE}
              className="mt-7 inline-flex items-center rounded-xl bg-[#2FA4A9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25888d]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                  Shopping Bag
                </h1>
                <p className="text-lg text-slate-500">
                  {summary.item_count}{" "}
                  {summary.item_count === 1 ? "Item" : "Items"}
                </p>
              </div>

              <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 pb-3 text-sm font-medium text-slate-500 md:grid">
                <p className="col-span-5">Product detail</p>
                <p className="col-span-2 text-center">Quantity</p>
                <p className="col-span-2 text-center">Price</p>
                <p className="col-span-2 text-center">Total</p>
                <p className="col-span-1 text-center">Remove</p>
              </div>

              <div className="divide-y divide-slate-200">
                {items.map((item) => (
                  <CartItemCard
                    key={isServerMode ? item.cart_item_id : item.product_id}
                    item={item}
                    isBusy={isUpdating}
                    onIncrease={() => handleIncrease(item)}
                    onDecrease={() => handleDecrease(item)}
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={PRODUCT_ROUTE}
                  className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#2FA4A9]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue shopping
                </Link>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={summary.item_count < 1 || isUpdating}
                  className="inline-flex items-center gap-1.5 text-sm text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear cart
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <CartSummaryCard summary={summary} isBusy={isUpdating} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPageContent;
