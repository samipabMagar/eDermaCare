"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validators/authSchemas";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginErrorAlert from "@/components/auth/LoginErrorAlert";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import { HOME_ROUTE } from "@/constants/routes";
import { cartService } from "@/services/cartService";
import { setCartItems } from "@/store/slices/cartSlice";
import { loginUser } from "@/store/thunks/authThunks";

const LoginPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, error } = useSelector((state) => state.auth);
  const guestCartItems = useSelector((state) => state.cart?.items ?? []);

  const normalizeServerCartItems = (items = []) => {
    return items.map((item) => ({
      product_id: Number(item.product_id),
      name: item.name || "",
      price: Number(item.price || 0),
      image: item.image || null,
      quantity: Number(item.quantity || 0),
    }));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const resultAction = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(resultAction)) {
      try {
        for (const item of guestCartItems) {
          await cartService.addItem(item.product_id, item.quantity);
        }

        const latestCart = await cartService.getCart();
        dispatch(
          setCartItems(normalizeServerCartItems(latestCart?.items || [])),
        );
      } catch {
        // Continue login redirect even if cart merge fails.
      }

      const requestedNextPath = searchParams.get("next");
      const safeRedirectPath =
        requestedNextPath && requestedNextPath.startsWith("/")
          ? requestedNextPath
          : HOME_ROUTE;

      router.push(safeRedirectPath);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your credentials to continue"
      sidebarTitle="Welcome Back!"
      sidebarSubtitle="Sign in to access your personalized skincare dashboard"
    >
      <LoginErrorAlert message={error} />
      <LoginForm
        register={register}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
      <LoginFooter />
    </AuthLayout>
  );
};

export default LoginPage;
