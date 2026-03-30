import { cookies } from "next/headers";
import axios from "axios";
import ProfileHeader from "@/components/user/profile/ProfileHeader";
import ChangePasswordForm from "@/components/user/profile/ChangePasswordForm";
import DoctorBasicInfoForm from "@/components/doctor/profile/DoctorBasicInfoForm";
import DoctorProfessionalForm from "@/components/doctor/profile/DoctorProfessionalForm";

const getDoctorProfileFromApi = async (token) => {
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const response = await axios.get(`${apiBase}/doctors/profile`, {
      headers: { Cookie: `token=${token}` },
    });
    return response.data?.data;
  } catch (error) {
    return null;
  }
};

export const metadata = {
  title: "Doctor Profile | E-DermaCare",
  description: "Manage your professional details and account settings.",
};

const DoctorProfilePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const doctorData = await getDoctorProfileFromApi(token);

  if (!doctorData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Unable to load profile. Please try again.
        </p>
      </div>
    );
  }

  // Flatten nested user object so we can reuse Patient Profile components cleanly
  const baseUser = {
    full_name: doctorData.user?.full_name || "",
    email: doctorData.user?.email || "",
    phone: doctorData.user?.phone || "",
    profile_image: doctorData.user?.profile_image || null,
    role: "doctor", // Hardcoded role since this is strictly the doctor boundary
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2FA4A9]">
            Account
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            My Professional Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information, clinical details, and security.
          </p>
        </div>

        {/* Reused: Avatar / Name header component */}
        <ProfileHeader user={baseUser} />

        {/* Doctor-specific basic info (Name, Phone) */}
        <DoctorBasicInfoForm user={baseUser} />

        {/* Doctor-specific professional attributes (Specialization, License, Fee, Bio...) */}
        <DoctorProfessionalForm profile={doctorData} />

        {/* Reused: Password Change form */}
        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default DoctorProfilePage;
