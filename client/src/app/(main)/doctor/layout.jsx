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

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#EFF4FF] via-[#F8FAFC] to-[#EEF2FF]" />
      </div>

      <div className="relative z-10 flex w-full flex-col lg:pl-72">
        <DoctorSidebar />

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
                Welcome back, Dr.{" "}
                {currentUser.full_name?.split(" ")[0] || "Doctor"}
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Here is your practice overview for today.
              </p>
            </div>
          </div>
        </header>

        <main className="w-full px-4 py-4 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
