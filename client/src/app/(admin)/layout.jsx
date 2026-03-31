import AdminSidebar from "@/components/admin/AdminSidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileFromApi } from "@/services/server/profileService";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const currentUser = await getProfileFromApi(token);

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#EAF8F8] via-[#F8FAFC] to-[#EEF7FB]" />
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#2FA4A9]/12 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-[#F5E6B3]/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full flex-col lg:pl-72">
        <AdminSidebar />
        <main className="w-full px-4 py-3 sm:px-6 ">{children}</main>
      </div>
    </div>
  );
}
