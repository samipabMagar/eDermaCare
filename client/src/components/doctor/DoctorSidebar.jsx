"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants/routes";

const baseLinkClass =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition";

const DoctorSidebar = ({ currentUser }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const mainItems = [
    {
      label: "Overview",
      href: ROUTES.DOCTOR_DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: "Appointments",
      href: ROUTES.DOCTOR_APPOINTMENTS,
      icon: CalendarDays,
    },
    { label: "Treatments", icon: Stethoscope, comingSoon: true },
    { label: "My Patients", icon: Users, comingSoon: true },
  ];

  const otherItems = [
    { label: "Messages", href: ROUTES.DOCTOR_MESSAGES, icon: MessageSquare },
    { label: "My Profile", href: ROUTES.DOCTOR_PROFILE, icon: User },
  ];

  const firstName = currentUser?.full_name?.split(" ")?.[0] || "Doctor";
  const initials =
    currentUser?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DR";

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
    <aside className="z-30 border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="p-4">
          <Link href={ROUTES.HOME} className="group flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2FA4A9]">
              <Heart className="h-4.5 w-4.5 text-white" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">eDermaCare</p>
              <p className="text-[11px] text-slate-500">Doctor Portal</p>
            </div>
          </Link>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Welcome back</p>
            <p className="text-sm font-semibold text-slate-900">
              Dr. {firstName}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-5 px-2 pb-3">
          <section>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>
            <nav className="mt-2 space-y-1">
              {mainItems.map((item) => {
                const Icon = item.icon;

                if (!item.href) {
                  return (
                    <div
                      key={item.label}
                      className={`${baseLinkClass} text-slate-400`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span className="flex flex-1 items-center justify-between">
                        {item.label}
                        {item.comingSoon ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Soon
                          </span>
                        ) : null}
                      </span>
                    </div>
                  );
                }

                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${baseLinkClass} ${
                      isActive
                        ? "bg-[#2FA4A9] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </section>

          <section>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Other
            </p>
            <nav className="mt-2 space-y-1">
              {otherItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${baseLinkClass} ${
                      isActive
                        ? "bg-[#2FA4A9] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </section>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2FA4A9]/10 text-sm font-semibold text-[#1D7D82]">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  Dr. {currentUser?.full_name || "Dermatologist"}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {currentUser?.email || "Clinical Dermatology"}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Logout"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
