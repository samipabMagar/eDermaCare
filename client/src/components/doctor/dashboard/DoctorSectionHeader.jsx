const DoctorSectionHeader = ({ title, subtitle, rightSlot = null }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {rightSlot}
    </div>
  );
};

export default DoctorSectionHeader;
