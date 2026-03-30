"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ClipboardList, House, LogOut, MessageSquare, Stethoscope, Users, UserCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants/routes";

const DoctorSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { label: "Overview", href: ROUTES.DOCTOR_DASHBOARD, icon: Stethoscope },
    { label: "Profile", href: ROUTES.DOCTOR_PROFILE, icon: UserCircle },
    { label: "Appointments", href: `${ROUTES.DOCTOR_DASHBOARD}#appointments`, icon: CalendarDays },
    { label: "Patients", href: `${ROUTES.DOCTOR_DASHBOARD}#patients`, icon: Users },
    { label: "Treatments", href: `${ROUTES.DOCTOR_DASHBOARD}#treatments`, icon: ClipboardList },
    { label: "Messages", href: `${ROUTES.DOCTOR_DASHBOARD}#messages`, icon: MessageSquare },
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
        <p className="text-xs font-semibold uppercase tracking-wider text-white/85">Doctor Area</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Practice Desk</h1>
        <p className="mt-2 text-sm text-white/85">Manage appointments, treatments, and patient communication.</p>
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
          // Active if current pathname exactly matches href
          const isActive =
            item.href === ROUTES.DOCTOR_DASHBOARD
              ? pathname === ROUTES.DOCTOR_DASHBOARD
              : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition lg:w-full ${
                isActive
                  ? "bg-white text-[#1D7D82] shadow-sm"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
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
          className="flex w-full items-center  gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-red-500/80 cursor-pointer hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
