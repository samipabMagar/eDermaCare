"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ShoppingBag,
  User,
} from "lucide-react";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants/routes";

const mainItems = [
  { label: "Dashboard", href: ROUTES.USER_DASHBOARD, icon: LayoutDashboard },
  {
    label: "My Orders",
    href: ROUTES.USER_DASHBOARD_ORDERS,
    icon: ShoppingBag,
  },
  {
    label: "Appointments",
    href: ROUTES.USER_DASHBOARD_APPOINTMENTS,
    icon: Calendar,
  },
  {
    label: "Order History",
    href: ROUTES.USER_DASHBOARD_ORDER_HISTORY,
    icon: ShoppingBag,
  },
  {
    label: "Payment History",
    href: ROUTES.USER_DASHBOARD_PAYMENTS,
    icon: CreditCard,
  },
];

const otherItems = [
  { label: "Profile", href: ROUTES.USER_PROFILE, icon: User },
  { label: "Messages", href: ROUTES.USER_DASHBOARD, icon: MessageCircle },
];

const UserSidebar = ({ currentUser }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState(currentUser || null);

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      const user = await authService.getCurrentUser();
      if (mounted && user) {
        setProfile(user);
      }
    };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    const name = profile?.full_name || "User";
    return name
      .split(" ")
      .map((chunk) => chunk[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.full_name]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      router.push(ROUTES.LOGIN);
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="z-30 w-full border-b border-slate-200 bg-white lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="px-5 pb-4 pt-5">
        <Link href={ROUTES.HOME} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F9EA5] text-white">
            <Heart className="h-4.5 w-4.5" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">eDermaCare</h2>
            <p className="text-[11px] text-slate-500">Patient Portal</p>
          </div>
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto px-4 pb-4 lg:block lg:flex-1 lg:overflow-visible">
        <nav className="min-w-65 space-y-2 lg:min-w-0">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0F9EA5] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <nav className="min-w-65 space-y-2 lg:mt-6 lg:min-w-0">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Other
          </p>
          {otherItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0F9EA5] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-4 mb-4 mt-auto hidden rounded-xl border border-slate-200 bg-slate-50 p-3 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F9EA5]/15 text-sm font-semibold text-[#0F9EA5]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {profile?.full_name || "User"}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {profile?.email || ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
