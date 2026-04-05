import AdminSidebar from "@/components/admin/AdminSidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileFromApi } from "@/services/server/profileService";
import { Bell, PanelLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#F3F5F7]">
      <div className="flex w-full">
        <AdminSidebar />

        <div className="min-w-0 flex-1 lg:pl-72">
          <main className="w-full p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
