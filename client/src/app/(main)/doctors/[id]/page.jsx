"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Phone,
  Shield,
  Star,
  UserRound,
} from "lucide-react";
import { doctorService } from "@/services/doctorService";
import BookAppointmentModal from "@/components/doctors/BookAppointmentModal";
import { DOCTORS_ROUTE } from "@/constants/routes";

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

const parseListItem = (item) => {
  if (item === null || item === undefined) return "";

  if (typeof item === "string") {
    return item.trim();
  }

  if (typeof item === "number") {
    return String(item);
  }

  if (typeof item === "object") {
    const prioritizedValue =
      item.degree ||
      item.certification ||
      item.title ||
      item.name ||
      item.value;

    if (typeof prioritizedValue === "string" && prioritizedValue.trim()) {
      return prioritizedValue.trim();
    }
  }

  return "";
};

const parseTextList = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(parseListItem).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,|;/)
      .map(parseListItem)
      .filter(Boolean);
  }

  const singleItem = parseListItem(value);
  return singleItem ? [singleItem] : [];
};

const formatEducationLabel = (education) => {
  if (!education) return "Verified doctor profile";

  if (typeof education === "string") {
    return education;
  }

  if (Array.isArray(education)) {
    const firstItem = education[0];

    if (typeof firstItem === "string") {
      return firstItem;
    }

    if (firstItem && typeof firstItem === "object" && firstItem.degree) {
      return firstItem.degree;
    }
  }

  if (typeof education === "object" && education.degree) {
    return education.degree;
  }

  return "Verified doctor profile";
};

const formatConsultationFee = (fee) => {
  const numericFee = Number(fee);
  if (!Number.isNaN(numericFee) && numericFee > 0) {
    return `Rs. ${numericFee.toLocaleString()}`;
  }
  return "Free";
};

const DoctorDetailPage = () => {
  const params = useParams();
  const doctorId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDoctor = async () => {
      try {
        setLoading(true);
        setError("");

        if (!doctorId) {
          throw new Error("Invalid doctor profile");
        }

        const profile = await doctorService.getDoctorByUserId(doctorId);

        if (!isMounted) return;

        if (!profile || profile.approval_status !== "approved") {
          setDoctor(null);
          setError("Doctor not found");
          return;
        }

        setDoctor(profile);
      } catch (loadError) {
        if (!isMounted) return;
        setDoctor(null);
        setError(loadError.message || "Unable to load doctor details");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDoctor();

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  const doctorName = doctor?.user?.full_name || "Doctor";
  const profileImageUrl = resolveProfileImageUrl(doctor?.user?.profile_image);
  const educationLabel = formatEducationLabel(doctor?.education);

  const certifications = useMemo(
    () => parseTextList(doctor?.certifications),
    [doctor?.certifications],
  );

  const educationEntries = useMemo(
    () => parseTextList(doctor?.education),
    [doctor?.education],
  );

  const hasEducation = educationEntries.length > 0;
  const hasCertifications = certifications.length > 0;

  const tabs = [
    { key: "about", label: "About" },
    { key: "credentials", label: "Credentials" },
  ];

  if (loading) {
    return (
      <section className="bg-slate-50 py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </section>
    );
  }

  if (error || !doctor) {
    return (
      <section className="bg-slate-50 py-16">
        <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-10">
          <h1 className="text-2xl font-bold text-slate-900">
            Doctor not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The doctor profile you are looking for is unavailable.
          </p>
          <Link
            href={DOCTORS_ROUTE}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0F9EA5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0c878d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to doctors
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <Link
          href={DOCTORS_ROUTE}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to doctors
        </Link>

        <article className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative border-b border-slate-200 bg-linear-to-r from-teal-50 via-cyan-50 to-white p-5 sm:p-7">
            <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
              {doctor.is_available
                ? "Available for appointment"
                : "Currently unavailable"}
            </span>

            <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 text-2xl font-bold text-teal-700 shadow-sm sm:h-24 sm:w-24">
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

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Dr. {doctorName}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-teal-700">
                    {doctor.specialization || "Dermatology Specialist"}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {educationLabel}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <BriefcaseBusiness className="h-3.5 w-3.5 text-teal-700" />
                      {doctor.years_of_experience ?? 0} years experience
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {Number(doctor.rating || 0).toFixed(1)} rating
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5 text-teal-700" />
                      {doctor.total_reviews ?? 0} reviews
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full rounded-xl border border-slate-200 bg-white p-4 md:w-72">
                <p className="text-xs text-slate-500">Consultation Fee</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatConsultationFee(doctor.consultation_fee)}
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-teal-700" />
                    {doctor.is_available
                      ? "Usually accepts booking requests"
                      : "Currently not accepting appointments"}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-700" />
                    Slots are selected during booking
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBookingModal(true)}
                  disabled={!doctor.is_available}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#0F9EA5] text-sm font-semibold text-white transition hover:bg-[#0c878d] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-white/95">
            <div className="flex gap-1 px-5 sm:px-7">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "border-teal-600 text-teal-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-3 sm:p-7">
            <div className="space-y-5 sm:col-span-2">
              {activeTab === "about" ? (
                <>
                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h2 className="text-base font-bold text-slate-900">
                      About
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {doctor.bio ||
                        "This doctor has not added a detailed bio yet. You can still book an appointment for consultation."}
                    </p>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
                      <Shield className="h-4 w-4 text-teal-700" />
                      Practice Information
                    </h2>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="inline-flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
                        License: {doctor.license_number || "Not provided"}
                      </p>
                      <p className="inline-flex items-start gap-2">
                        <Award className="mt-0.5 h-4 w-4 text-slate-400" />
                        Approval: {doctor.approval_status || "pending"}
                      </p>
                    </div>
                  </section>
                </>
              ) : null}

              {activeTab === "credentials" ? (
                <section className="space-y-4">
                  {hasEducation ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <h2 className="text-base font-bold text-slate-900">
                        Education
                      </h2>
                      <ul className="mt-3 space-y-2">
                        {educationEntries.map((entry, index) => (
                          <li
                            key={`${entry}-${index}`}
                            className="inline-flex w-full items-start gap-2 text-sm text-slate-600"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                            {entry}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {hasCertifications ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <h2 className="text-base font-bold text-slate-900">
                        Certifications
                      </h2>
                      <ul className="mt-3 space-y-2">
                        {certifications.map((entry, index) => (
                          <li
                            key={`${entry}-${index}`}
                            className="inline-flex w-full items-start gap-2 text-sm text-slate-600"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                            {entry}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {!hasEducation && !hasCertifications ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm text-slate-600">
                        No credentials added yet.
                      </p>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Contact Information
                </h3>
                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <p className="inline-flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {doctor.user?.email || "No email provided"}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {doctor.user?.phone || "No phone provided"}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={
                      doctor.user?.email ? `mailto:${doctor.user.email}` : "#"
                    }
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Email
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(true)}
                    disabled={!doctor.is_available}
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#0F9EA5] text-xs font-semibold text-white transition hover:bg-[#0c878d] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Book
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </div>

      <BookAppointmentModal
        doctor={doctor}
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </section>
  );
};

export default DoctorDetailPage;
