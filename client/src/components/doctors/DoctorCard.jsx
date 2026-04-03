import Link from "next/link";
import {
  Award,
  BriefcaseBusiness,
  Calendar,
  Clock,
  Mail,
  Phone,
  Star,
  Users,
} from "lucide-react";

const resolveProfileImageUrl = (profileImagePath) => {
  if (!profileImagePath) return null;

  if (/^https?:\/\//i.test(profileImagePath)) {
    return profileImagePath;
  }

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  try {
    const origin = new URL(apiBase).origin;
    const normalizedPath = profileImagePath.startsWith("/")
      ? profileImagePath
      : `/${profileImagePath}`;
    return `${origin}${normalizedPath}`;
  } catch {
    return null;
  }
};

const getDoctorInitials = (fullName = "Doctor") => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const formatConsultationFee = (fee) => {
  const amount = Number(fee);

  if (Number.isNaN(amount)) {
    return "N/A";
  }

  return `Rs. ${amount.toLocaleString()}`;
};

const getTags = (specialization) => {
  if (!specialization) return [];

  return specialization
    .split(/,|&|\//)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);
};

const DoctorCard = ({ doctor }) => {
  const profileImageUrl = resolveProfileImageUrl(doctor.user?.profile_image);
  const doctorName = doctor.user?.full_name || "Doctor";
  const doctorId = doctor.user?.user_id;
  const tagList = getTags(doctor.specialization);
  const isTopRated = Number(doctor.rating || 0) >= 4.8;

  const badgeText = isTopRated
    ? "Top Rated"
    : doctor.is_available
      ? "Available"
      : null;

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative bg-linear-to-br from-teal-50 to-cyan-50 p-5 pb-12">
        {badgeText ? (
          <span className="absolute right-3 top-3 rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {badgeText}
          </span>
        ) : null}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Award className="h-3 w-3 text-teal-600" />
          <span>{doctor.education || "Verified doctor profile"}</span>
        </div>
      </div>

      <div className="relative -mt-9 px-5">
        <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-lg font-bold text-teal-700 shadow-sm">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={doctorName}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span>{getDoctorInitials(doctorName)}</span>
          )}
        </div>
      </div>

      <div className="p-5 pt-3">
        <h2 className="text-base font-bold text-slate-900">Dr. {doctorName}</h2>
        <p className="mt-0.5 text-xs font-semibold text-teal-700">
          {doctor.specialization || "Dermatology Specialist"}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {doctor.bio ||
            "Experienced skin specialist focused on evidence-based treatment."}
        </p>

        <div className="mt-4 flex items-center gap-4 border-y border-slate-200 py-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" />
            <span className="text-xs font-bold text-slate-800">
              {Number(doctor.rating || 0).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500">
              ({doctor.total_reviews || 0})
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-700">
            <BriefcaseBusiness className="h-3.5 w-3.5 text-teal-700" />
            {doctor.years_of_experience ?? 0} yrs
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-700">
            <Users className="h-3.5 w-3.5 text-teal-700" />
            {doctor.total_reviews || 0}+ reviews
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tagList.length ? (
            tagList.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              Dermatology
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="h-3 w-3" />
              <span>
                {doctor.is_available
                  ? "Available for appointment"
                  : "Currently unavailable"}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-teal-700">
              <Calendar className="h-3 w-3" />
              <span>
                {doctor.is_available
                  ? "Book your next slot now"
                  : "Check later for slots"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500">Consultation</p>
            <p className="text-sm font-bold text-slate-900">
              {formatConsultationFee(doctor.consultation_fee)}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs text-slate-500">
          <p className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            {doctor.user?.email || "No email provided"}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            {doctor.user?.phone || "No phone provided"}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={doctor.user?.email ? `mailto:${doctor.user.email}` : "#"}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-slate-200 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Contact
          </Link>
          <Link
            href={
              doctorId
                ? `/dashboard/appointments?doctorId=${doctorId}`
                : "/dashboard/appointments"
            }
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#0F9EA5] text-xs font-medium text-white transition hover:bg-[#0c878d]"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </article>
  );
};

export default DoctorCard;
