const DoctorOverviewStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2.5 ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-teal-700">
                {item.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{item.label}</p>
          </article>
        );
      })}
    </div>
  );
};

export default DoctorOverviewStats;
