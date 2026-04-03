"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { LOGIN_ROUTE, CART_ROUTE, PRODUCT_ROUTE } from "@/constants/routes";
import { setCartItems } from "@/store/slices/cartSlice";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import CheckoutInfoStep from "@/components/checkout/CheckoutInfoStep";
import CheckoutPaymentStep from "@/components/checkout/CheckoutPaymentStep";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";

const buildSummary = (items = []) => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const itemCount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
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

const CheckoutPageContent = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(buildSummary([]));
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    shipping_address: "",
    contact_phone: "",
    notes: "",
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        const user = await authService.getCurrentUser();
        if (!user) {
          toast.info("Please login to continue checkout");
          router.push(LOGIN_ROUTE);
          return;
        }

        const cart = await cartService.getCart();
        const cartItems = Array.isArray(cart?.items) ? cart.items : [];

        if (cartItems.length === 0) {
          setItems([]);
          setSummary(buildSummary([]));
          return;
        }

        setItems(cartItems);
        setSummary(cart?.summary || buildSummary(cartItems));
      } catch (error) {
        toast.error(error.message || "Failed to load checkout data");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  const total = useMemo(() => Number(summary?.grand_total || 0), [summary]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (formData.shipping_address.trim().length < 5) {
      toast.error("Shipping address must be at least 5 characters");
      return;
    }

    if (
      formData.contact_phone.trim() &&
      formData.contact_phone.trim().length < 7
    ) {
      toast.error("Contact phone must be at least 7 characters");
      return;
    }

    setStep(2);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);

      const order = await orderService.checkout({
        shipping_address: formData.shipping_address.trim(),
        contact_phone: formData.contact_phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        payment_method: paymentMethod,
      });

      if (paymentMethod === "khalti") {
        const returnUrl = `${window.location.origin}/payment/khalti/return`;
        const paymentInit = await paymentService.initiateKhalti(
          order.order_id,
          returnUrl,
        );
        const paymentUrl =
          paymentInit?.khalti?.payment_url || paymentInit?.khalti?.paymentUrl;

        if (!paymentUrl) {
          throw new Error("Khalti payment URL is missing");
        }

        dispatch(setCartItems([]));
        window.location.assign(paymentUrl);
        return;
      }

      dispatch(setCartItems([]));
      toast.success("Order placed successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading checkout...
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 lg:px-8">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-slate-800">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Add products to continue checkout.
          </p>
          <Link
            href={PRODUCT_ROUTE}
            className="mt-6 inline-flex items-center rounded-xl bg-[#2FA4A9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25888d]"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={CART_ROUTE}
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#0F9EA5]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold text-slate-900 md:text-3xl">
        Checkout
      </h1>
      <CheckoutProgress currentStep={step} />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 1 ? (
            <CheckoutInfoStep
              formData={formData}
              onChange={handleInputChange}
              onContinue={handleContinue}
              isBusy={isSubmitting}
            />
          ) : (
            <CheckoutPaymentStep
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
              onBack={() => setStep(1)}
              onPlaceOrder={handlePlaceOrder}
              isBusy={isSubmitting}
              total={total}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <CheckoutOrderSummary items={items} summary={summary} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageContent;
