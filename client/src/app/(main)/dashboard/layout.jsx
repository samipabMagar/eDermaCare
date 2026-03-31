import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileFromApi } from "@/services/server/profileService";
import UserSidebar from "@/components/user/UserSidebar";

export default async function UserDashboardLayout({ children }) {
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

  if (currentUser.role === "doctor") {
    redirect("/doctor/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#EFFAFB] via-[#F8FAFC] to-[#EEF7FB]" />
      </div>

      <div className="relative z-10 flex w-full flex-col lg:pl-72">
        <UserSidebar />
        <main className="w-full px-4 py-3 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
