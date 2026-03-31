"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, ClipboardCheck, Stethoscope, LogOut, House, UserCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/authService";

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    {
      label: "Products",
      href: ROUTES.ADMIN_PRODUCTS,
      icon: ShoppingBag,
      match: "startsWith",
    },
    {
      label: "Pending Doctors",
      href: ROUTES.ADMIN_PENDING_DOCTORS,
      icon: ClipboardCheck,
      match: "exact",
    },
    {
      label: "All Doctors",
      href: ROUTES.ADMIN_ALL_DOCTORS,
      icon: Stethoscope,
      match: "exact",
    },
    {
      label: "My Profile",
      href: ROUTES.ADMIN_PROFILE,
      icon: UserCircle,
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

  return (
    <aside className="z-30 w-full border-b border-[#1D7D82] bg-[#2FA4A9] lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="px-6 pb-4 pt-6 lg:pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/85">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          eDermaCare
        </h1>
        <p className="mt-2 text-sm text-white/85">Manage doctors and products from one place.</p>
        <Link
          href={ROUTES.HOME}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25"
        >
          <House className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Home
        </Link>
      </div>

      <nav className="mx-2 flex gap-2 rounded-2xl bg-white/10 p-2 shadow-sm overflow-x-auto px-4 pb-4 lg:block lg:space-y-2 lg:overflow-visible lg:px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.match === "startsWith"
              ? pathname === item.href || pathname.startsWith(`${item.href}/`)
              : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex border-b border-white/30 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition lg:w-full ${
                isActive
                  ? "bg-white text-[#1D7D82] shadow-sm"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-[#1D7D82]" : "text-white/85 group-hover:text-white"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-4 mt-2 border-t border-white/20 pt-3 lg:mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full  items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-red-500/80 cursor-pointer hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
