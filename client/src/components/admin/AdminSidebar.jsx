"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Stethoscope,
  ClipboardCheck,
  UserCheck,
  ClipboardList,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/authService";
import { adminService } from "@/services/adminService";

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const mainItems = [
    {
      label: "Overview",
      href: ROUTES.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
      match: "exact",
    },
    {
      label: "Users",
      href: ROUTES.ADMIN_USERS,
      icon: Users,
      match: "startsWith",
    },
    {
      label: "Doctors",
      href: ROUTES.ADMIN_ALL_DOCTORS,
      icon: ClipboardCheck,
      match: "exact",
    },
    {
      label: "Pending Doctors",
      href: ROUTES.ADMIN_PENDING_DOCTORS,
      icon: UserCheck,
      match: "exact",
    },
    {
      label: "Products",
      href: ROUTES.ADMIN_PRODUCTS,
      icon: Package,
      match: "startsWith",
    },
    {
      label: "Orders",
      href: null,
      icon: ShoppingBag,
      match: "exact",
    },
  ];

  const otherItems = [
    {
      label: "Treatments",
      href: null,
      icon: ClipboardList,
      match: "exact",
    },
    {
      label: "Transactions",
      href: null,
      icon: CreditCard,
      match: "exact",
    },
    {
      label: "Settings",
      href: ROUTES.ADMIN_PROFILE,
      icon: Settings,
      match: "exact",
    },
  ];

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

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const pendingDoctors = await adminService.getPendingDoctors();
        setPendingCount(pendingDoctors.length);
      } catch {
        setPendingCount(0);
      }
    };

    loadPendingCount();
  }, []);

  const getIsActive = (item) => {
    if (item.match === "startsWith") {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }

    return pathname === item.href;
  };

  const renderMenuItems = (items) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isClickable = Boolean(item.href);
      const isActive = isClickable && getIsActive(item);

      const className = `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? "bg-[#2FA4A9] text-white shadow-sm"
          : isClickable
            ? "text-slate-700 hover:bg-slate-100"
            : "cursor-not-allowed text-slate-500"
      }`;

      const content = (
        <>
          <Icon className="h-4.5 w-4.5 shrink-0" />
          <span>{item.label}</span>

          {item.label === "Pending Doctors" && pendingCount > 0 && (
            <span className="ml-auto rounded-full bg-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {pendingCount}
            </span>
          )}
        </>
      );

      if (!isClickable) {
        return (
          <div key={item.label} className={className}>
            {content}
          </div>
        );
      }

      return (
        <Link key={item.href} href={item.href} className={className}>
          {content}
        </Link>
      );
    });
  };

  return (
    <aside className="z-30 w-full border-b border-slate-200 bg-[#F4F5F7] lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="px-4 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold leading-5 text-slate-900">
              eDermaCare
            </h1>
            <p className="mt-1 text-sm text-slate-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="mx-3 space-y-8 py-3">
        <div>
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Management
          </p>
          <div className="mt-2 space-y-1">{renderMenuItems(mainItems)}</div>
        </div>

        <div>
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Other
          </p>
          <div className="mt-2 space-y-1">{renderMenuItems(otherItems)}</div>
        </div>
      </nav>

      <div className="mx-4 mb-4 mt-auto rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className=" flex w-full  items-center  justify-center gap-2 rounded-xl border border-slate-200 px-3 cursor-pointer py-2 text-sm font-medium text-slate-600 transition hover:text-white hover:bg-rose-500"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
