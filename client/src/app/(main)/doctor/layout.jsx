import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileFromApi } from "@/services/server/profileService";
import DoctorSidebar from "@/components/doctor/DoctorSidebar";

export default async function DoctorLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const currentUser = await getProfileFromApi(token);

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role === "admin") {
    redirect("/admin");
  }

  if (currentUser.role === "user") {
    redirect("/dashboard");
  }

  const firstName = currentUser.full_name?.split(" ")?.[0] || "Doctor";
  const initials =
    currentUser.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DR";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <DoctorSidebar currentUser={currentUser} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
            <div>
              <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
                Welcome back, Dr. {firstName}
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Here&apos;s your practice overview for today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2FA4A9]/10 text-sm font-semibold text-[#1D7D82]">
                {initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 py-4 sm:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
