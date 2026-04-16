import { MapPin } from "lucide-react";

export default function ContactMap() {
  return (
    <div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-slate-100">
      <div className="relative" style={{ paddingTop: "56.25%" }}>
        <iframe
          title="eDermaCare - Nepal"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9029.880213000024!2d83.99634063703697!3d28.213395383686535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39959434ad2a5bf9%3A0xf4e7f9c749f63113!2sInformatics%20College%20Pokhara!5e0!3m2!1sen!2snp!4v1776312956720!5m2!1sen!2snp"
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="flex items-center gap-3 bg-white px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8f7f8] text-[#2FA4A9]">
          <MapPin className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-800">Ranipauwa, Pokhara</p>
          <p className="text-[11px] text-slate-500">
            Gandaki Province, Nepal — Near Informatics College
          </p>
        </div>
        <a
          href="https://maps.app.goo.gl/X83H3BsvKTS4qpJo8"
          target="_blank"
          rel="noreferrer"
          className="ml-auto shrink-0 rounded-lg border border-[#2FA4A9]/40 px-3 py-1.5 text-xs font-semibold text-[#2FA4A9] transition hover:bg-[#2FA4A9] hover:text-white"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}
