import ContactHero from "./ContactHero";
import ContactCards from "./ContactCards";
import ContactForm from "./ContactForm";
import ContactQuickSupport from "./ContactQuickSupport";
import ContactMap from "./ContactMap";
import ContactFaq from "./ContactFaq";
import ContactCta from "./ContactCta";

export default function ContactPageContent() {
  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-[#2FA4A9]/20">
      <ContactHero />

      <ContactCards />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <ContactForm />

          <div className="flex flex-col gap-8">
            <ContactQuickSupport />
            <ContactMap />
          </div>
        </div>
      </section>

      <ContactFaq />

      <ContactCta />
    </div>
  );
}
