import { Calendar, Clock } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DashboardUpcomingAppointments = ({ appointments }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900">Upcoming</h2>
        <span className="text-xs text-slate-500">
          {appointments.length} scheduled
        </span>
      </header>

      {appointments.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">No upcoming appointments.</p>
      ) : (
        <div className="space-y-3 p-4">
          {appointments.map((appointment) => (
            <article
              key={appointment.appointment_id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  {appointment.doctor?.full_name || "Doctor"}
                </p>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-teal-700">
                  {appointment.status}
                </span>
              </div>

              <p className="mb-3 text-xs text-slate-500">
                Dermatology consultation
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(appointment.scheduled_at)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(appointment.scheduled_at)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default DashboardUpcomingAppointments;
