"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import TreatmentBookingModal from "@/components/treatments/TreatmentBookingModal";
import { treatmentService } from "@/services/treatmentService";
import { resolveImageUrl } from "@/utils/products/productCardHelpers";
import { TREATMENTS_ROUTE } from "@/constants/routes";

const TreatmentDetail = ({ treatmentId }) => {
  const router = useRouter();
  const [treatment, setTreatment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        setIsLoading(true);
        const data = await treatmentService.getTreatmentById(treatmentId);
        setTreatment({
          ...data,
          image: data.image_url ? resolveImageUrl(data.image_url) : null,
          benefits: Array.isArray(data.benefit_tags) ? data.benefit_tags : [],
          duration: data.duration_minutes ? `${data.duration_minutes} min` : "N/A",
        });
      } catch (error) {
        toast.error("Failed to load treatment details");
        setTreatment(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (treatmentId) {
      fetchTreatment();
    } else {
      console.error("TreatmentDetail: treatmentId is undefined or null", treatmentId);
      setIsLoading(false);
    }
  }, [treatmentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-slate-500 animate-pulse">Loading treatment...</div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex flex-col items-center justify-center py-40">
          <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Treatment Not Found</h2>
          <p className="text-slate-500 mb-6">The treatment you're looking for doesn't exist.</p>
          <Link
            href={TREATMENTS_ROUTE}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Treatments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[340px] md:h-[400px] overflow-hidden bg-slate-900">
          {treatment.image ? (
            <img
              src={treatment.image}
              alt={treatment.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
             <div className="w-full h-full bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mx-auto w-full max-w-7xl px-6">
              <button 
                onClick={() => router.back()} 
                className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Treatments
              </button>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-sm">
                {treatment.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F9EA5]" />
                <span className="text-sm text-slate-700 font-medium">{treatment.duration}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-xs text-slate-500">Starting from</span>
                <p className="text-xl font-bold text-[#0F9EA5]">Rs. {Number(treatment.price).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setBookingOpen(true)}
                className="hidden md:flex items-center bg-gradient-to-r from-[#0F9EA5] to-[#2FA4A9] text-white hover:opacity-90 px-6 py-2.5 rounded-lg font-semibold transition"
              >
                <Calendar className="w-4 h-4 mr-2" /> Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Treatment</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {treatment.description || "No detailed description available for this treatment."}
                </p>
              </div>
            </div>

             {/* Benefits Area if they exist */}
            {treatment.benefits.length > 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Treatment Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {treatment.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                         <ThumbsUp className="w-4 h-4 text-[#0F9EA5]" />
                      </div>
                      <span className="text-slate-700 pt-1">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 sticky top-28 self-start">
            {/* Booking Card */}
            <div className="bg-white border text-center border-slate-200 rounded-2xl p-6 shadow-xl">
              <div className="mx-auto w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-[#0F9EA5]" />
              </div>
              
              <h3 className="font-bold text-lg text-slate-900 mb-1">{treatment.name}</h3>
              <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-6">Professional care & noticeable results.</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium text-slate-900">{treatment.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Consultation</span>
                  <span className="font-medium text-slate-900 text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-100 mt-2 pt-4">
                  <span className="font-semibold text-slate-900 pt-1">Price</span>
                  <span className="text-2xl font-bold text-[#0F9EA5]">Rs. {Number(treatment.price).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setBookingOpen(true)}
                className="flex items-center justify-center w-full bg-gradient-to-r from-[#0F9EA5] to-[#2FA4A9] text-white hover:opacity-90 px-4 py-3 rounded-lg font-semibold transition shadow-md shadow-teal-500/20"
              >
                <Calendar className="w-4 h-4 mr-2" /> Book This Treatment
              </button>
            </div>
            
            {/* Minimal Ideal For / Tag representation */}
            {treatment.benefits.length > 0 && (
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                 <h4 className="font-semibold text-slate-900 mb-4">Quick Tags</h4>
                 <div className="flex flex-wrap gap-2">
                   {treatment.benefits.map((item) => (
                     <span key={item} className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                       {item}
                     </span>
                   ))}
                 </div>
               </div>
            )}
          </div>
        </div>
      </section>

      <TreatmentBookingModal
        open={bookingOpen}
        treatment={treatment}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
};

export default TreatmentDetail;
