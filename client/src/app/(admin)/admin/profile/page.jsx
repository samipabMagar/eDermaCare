import axios from "axios";
import { cookies } from "next/headers";
import ProfileHeader from "@/components/user/profile/ProfileHeader";
import ChangePasswordForm from "@/components/user/profile/ChangePasswordForm";
import AdminBasicInfoForm from "@/components/admin/profile/AdminBasicInfoForm";

export const metadata = {
  title: "Admin Profile | E-DermaCare",
  description: "Manage your admin account details and security settings.",
};

// Fetch the currently logged-in admin's profile from the API (server-side).
const getAdminProfileFromApi = async (token) => {
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const response = await axios.get(`${apiBase}/users/profile`, {
      headers: { Cookie: `token=${token}` },
    });
    return response.data?.data || null;
  } catch {
    return null;
  }
};

const AdminProfilePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await getAdminProfileFromApi(token);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Unable to load profile. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2FA4A9]">
            Account
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        <ProfileHeader user={user} />

        <AdminBasicInfoForm user={user} />

        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default AdminProfilePage;
