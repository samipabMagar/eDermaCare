"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  Heart,
  House,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Stethoscope,
  UserCircle,
  Users,
} from "lucide-react";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants/routes";

const DoctorSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useSelector((state) => state.auth?.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const mainItems = [
    { label: "Overview", href: ROUTES.DOCTOR_DASHBOARD, icon: LayoutDashboard },
    {
      label: "Appointments",
      href: ROUTES.DOCTOR_APPOINTMENTS,
      icon: CalendarDays,
    },
  ];

  const comingSoonMainItems = [
    { label: "Treatments", icon: Stethoscope },
    { label: "My Patients", icon: Users },
  ];

  const otherItems = [
    { label: "My Profile", href: ROUTES.DOCTOR_PROFILE, icon: UserCircle },
  ];

  const comingSoonOtherItems = [{ label: "Messages", icon: MessageSquare }];

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
      <div className="px-6 pb-5 pt-6 lg:pb-6">
        <Link href={ROUTES.HOME} className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
            <Heart className="h-4.5 w-4.5 text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">eDermaCare</p>
            <p className="text-[11px] text-white/80">Doctor Portal</p>
          </div>
        </Link>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/85">
          Doctor Area
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          Practice Desk
        </h1>
        <p className="mt-2 text-sm text-white/85">
          Manage appointments, treatments, and patient communication.
        </p>
        <Link
          href={ROUTES.HOME}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25"
        >
          <House className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Home
        </Link>
      </div>

      <div className="space-y-4 px-4 pb-4">
        <section className="rounded-2xl bg-white/10 p-2 shadow-sm">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70">
            Main Menu
          </p>
          <nav className="space-y-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-[#1D7D82] shadow-sm"
                      : "text-white/90 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {comingSoonMainItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60"
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className="flex flex-1 items-center justify-between">
                    {item.label}
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
                      Soon
                    </span>
                  </span>
                </div>
              );
            })}
          </nav>
        </section>

        <section className="rounded-2xl bg-white/10 p-2 shadow-sm">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70">
            Other
          </p>
          <nav className="space-y-1">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-[#1D7D82] shadow-sm"
                      : "text-white/90 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className="flex flex-1 items-center justify-between">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {comingSoonOtherItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60"
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className="flex flex-1 items-center justify-between">
                    {item.label}
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
                      Soon
                    </span>
                  </span>
                </div>
              );
            })}
          </nav>
        </section>
      </div>

      <div className="mx-4 mb-4 mt-2 border-t border-white/20 pt-3 lg:mt-auto">
        <div className="mb-3 rounded-xl bg-white/15 p-3">
          <p className="truncate text-sm font-semibold text-white">
            Dr. {currentUser?.full_name || "Dermatologist"}
          </p>
          <p className="truncate text-[11px] text-white/80">
            {currentUser?.email || "Clinical Dermatology"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-red-500/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
