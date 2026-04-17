import TreatmentDetail from "@/components/treatments/TreatmentDetail";

export const metadata = {
  title: "Treatment Details | eDermaCare",
  description: "Learn more about our aesthetic and dermatological treatments.",
};

export default async function TreatmentDetailPage({ params }) {
  const resolvedParams = await params;
  return <TreatmentDetail treatmentId={resolvedParams.id} />;
}
