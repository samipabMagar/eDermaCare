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
        <main className="w-full px-4 py-3 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
