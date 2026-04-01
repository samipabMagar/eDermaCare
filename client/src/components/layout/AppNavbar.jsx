"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Menu, ShoppingCart, X } from "lucide-react";
import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";
import { setCartItems } from "@/store/slices/cartSlice";
import ProfileMenuModal from "@/components/layout/ProfileMenuModal";
import {
  CART_ROUTE,
  HOME_ROUTE,
  LOGIN_ROUTE,
  PRODUCT_ROUTE,
  REGISTER_ROUTE,
} from "@/constants/routes";
import { navLinks } from "@/constants/navData";

const resolveProfileImageUrl = (profileImagePath) => {
  if (!profileImagePath) return null;

  if (/^https?:\/\//i.test(profileImagePath)) {
    return profileImagePath;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return null;

  try {
    const origin = new URL(apiBase).origin;
    const normalizedPath = profileImagePath.startsWith("/")
      ? profileImagePath
      : `/${profileImagePath}`;
    return `${origin}${normalizedPath}`;
  } catch {
    return null;
  }
};

const AppNavbar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const guestCartItems = useSelector((state) => state.cart?.items ?? []);
  const [currentUser, setCurrentUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartItemCount = useMemo(
    () =>
      guestCartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [guestCartItems],
  );

  const hideNavbar =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/doctor/dashboard") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (!user) return;

      try {
        const serverCart = await cartService.getCart();
        const normalizedItems = (serverCart?.items || []).map((item) => ({
          product_id: Number(item.product_id),
          name: item.name || "",
          price: Number(item.price || 0),
          image: item.image || null,
          quantity: Number(item.quantity || 0),
        }));

        dispatch(setCartItems(normalizedItems));
      } catch {
        // Keep existing cart state if server cart fetch fails.
      }
    };
    loadCurrentUser();
  }, [dispatch]);

  const profileImageUrl = useMemo(
    () => resolveProfileImageUrl(currentUser?.profile_image),
    [currentUser?.profile_image],
  );

  if (hideNavbar) return null;

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 shadow-md backdrop-blur-md border-b border-slate-200/60"
          : "bg-white/90 border-b border-slate-200/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        <Link href={HOME_ROUTE} className="flex items-center">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#2FA4A9]">e</span>
            <span className="text-slate-800">Derma</span>
            <span className="text-[#2FA4A9]">Care</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 rounded-lg transition-colors duration-200 group ${
                  isActive
                    ? "text-[#2FA4A9] font-semibold"
                    : "hover:text-[#2FA4A9] hover:bg-[#e8f7f8]"
                }`}
              >
                {link.label}

                <span
                  className={`absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-[#2FA4A9] transition-transform duration-200 origin-left ${
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href={CART_ROUTE}
            className="relative p-2 rounded-lg text-slate-500 transition-colors hover:text-[#2FA4A9] hover:bg-[#e8f7f8]"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2FA4A9] px-1.5 text-[10px] font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </Link>

          {currentUser ? (
            <ProfileMenuModal
              currentUser={currentUser}
              profileImageUrl={profileImageUrl}
              onLoggedOut={() => setCurrentUser(null)}
            />
          ) : (
            <>
              <Link
                href={LOGIN_ROUTE}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#2FA4A9] hover:text-[#2FA4A9]"
              >
                Sign In
              </Link>
              <Link
                href={REGISTER_ROUTE}
                className="rounded-lg bg-[#2FA4A9] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#25888d] hover:shadow-md active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={`mobile-${link.href}`}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#e8f7f8] text-[#2FA4A9] font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#2FA4A9]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href={CART_ROUTE}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-[#2FA4A9] transition"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartItemCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2FA4A9] px-1.5 text-[10px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {currentUser ? null : (
              <>
                <Link
                  href={LOGIN_ROUTE}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#2FA4A9] hover:text-[#2FA4A9]"
                >
                  Sign In
                </Link>
                <Link
                  href={REGISTER_ROUTE}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded-lg bg-[#2FA4A9] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#25888d]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AppNavbar;
