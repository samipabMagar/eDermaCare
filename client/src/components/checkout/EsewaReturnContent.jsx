"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { paymentService } from "@/services/paymentService";
import { LOGIN_ROUTE } from "@/constants/routes";

const EsewaReturnContent = ({ mode = "success" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Checking payment status...");

  const data = useMemo(() => searchParams.get("data") || "", [searchParams]);
  const orderIdFromQuery = useMemo(
    () => searchParams.get("orderId") || "",
    [searchParams],
  );

  useEffect(() => {
    const runVerification = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.push(LOGIN_ROUTE);
          return;
        }

        if (mode === "failure") {
          setStatus("failed");
          setMessage("Payment was cancelled or failed on eSewa.");
          return;
        }

        const storedOrderId =
          window.localStorage.getItem("pendingEsewaOrderId") || "";
        const orderId = orderIdFromQuery || storedOrderId;

        if (!orderId) {
          setStatus("failed");
          setMessage("Order id not found for verification.");
          return;
        }

        if (!data) {
          setStatus("failed");
          setMessage("Missing eSewa verification data.");
          return;
        }

        const result = await paymentService.verifyEsewa(orderId, {
          data,
        });

        if (String(result?.payment_status || "").toLowerCase() === "paid") {
          setStatus("success");
          setMessage("Payment completed successfully.");
          window.localStorage.removeItem("pendingEsewaOrderId");
          toast.success("Payment verified successfully");
          return;
        }

        if (String(result?.payment_status || "").toLowerCase() === "pending") {
          setStatus("pending");
          setMessage("Payment is still pending. Please check again shortly.");
          return;
        }

        setStatus("failed");
        setMessage("Payment was not completed.");
      } catch (error) {
        setStatus("failed");
        setMessage(error.message || "Failed to verify payment");
      }
    };

    runVerification();
  }, [data, mode, orderIdFromQuery, router]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-12 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          eSewa Payment Status
        </h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1B2731] px-5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#111B22]"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
          >
            Back to Cart
          </Link>
        </div>

        {status === "loading" && (
          <p className="mt-5 text-xs text-slate-500">
            Please wait, verifying with eSewa...
          </p>
        )}
      </div>
    </div>
  );
};

export default EsewaReturnContent;
