"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut,User } from "lucide-react";
import { authService } from "@/services/authService";
import {
  ADMIN_DASHBOARD_ROUTE,
  DOCTOR_DASHBOARD_ROUTE,
  HOME_ROUTE,
  LOGIN_ROUTE,
  USER_DASHBOARD_ROUTE,
  USER_PROFILE_ROUTE,
} from "@/constants/routes";

const ProfileMenuModal = ({ currentUser, profileImageUrl, onLoggedOut }) => {
  const router = useRouter();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dashboardHref =
    currentUser?.role === "admin"
      ? ADMIN_DASHBOARD_ROUTE
      : currentUser?.role === "doctor"
        ? DOCTOR_DASHBOARD_ROUTE
        : USER_DASHBOARD_ROUTE;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setMenuOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      onLoggedOut?.();
      setMenuOpen(false);
      router.push(HOME_ROUTE);
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = currentUser?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className={`relative rounded-full cursor-pointer transition-all duration-200 ring-2 ${
          menuOpen
            ? "ring-[#2FA4A9] ring-offset-2"
            : "ring-transparent hover:ring-[#2FA4A9] hover:ring-offset-2"
        }`}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-label="Open profile menu"
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={`${currentUser?.full_name || "User"} profile`}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f7f8] text-[#2FA4A9] font-semibold text-sm">
            {initials || <User className="h-4 w-4" />}
          </span>
        )}
      </button>

      <div
        role="dialog"
        aria-label="Profile menu"
        className={`absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-200 origin-top-right ${
          menuOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="rounded-t-2xl bg-gradient-to-br from-[#e8f7f8] to-[#f0fafb] px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={currentUser?.full_name}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2FA4A9] text-white font-semibold text-sm shadow-sm">
                {initials || <User className="h-4 w-4" />}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {currentUser?.full_name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-2 space-y-0.5">
          <Link
            href={USER_PROFILE_ROUTE}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-[#e8f7f8] hover:text-[#2FA4A9]"
          >
            <User className="h-4 w-4 shrink-0" aria-hidden="true" />
            Profile
          </Link>

          <Link
            href={dashboardHref}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-[#e8f7f8] hover:text-[#2FA4A9]"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
            Dashboard
          </Link>

         
        </div>

        <div className="p-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {isLoggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenuModal;
