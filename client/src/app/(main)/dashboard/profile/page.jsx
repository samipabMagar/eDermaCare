import { cookies } from "next/headers";
import { getProfileFromApi } from "@/services/server/profileService";
import ProfileHeader from "@/components/user/profile/ProfileHeader";
import EditProfileForm from "@/components/user/profile/EditProfileForm";
import ChangePasswordForm from "@/components/user/profile/ChangePasswordForm";

export const metadata = {
  title: "My Profile | E-DermaCare",
  description: "View and update your personal information and password.",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await getProfileFromApi(token);

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
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-1  ">
      <div className=" w-full max-w-5xl space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            Account
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal details and security settings.
          </p>
        </div>

        <ProfileHeader user={user} />

        <EditProfileForm user={user} />

        <ChangePasswordForm />
      </div>
    </div>
  );
}
