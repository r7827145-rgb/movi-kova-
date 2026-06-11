export default function AdminStats({ stats }: { stats: any }) {
  const cards = [
    { label: "Total Bookings", value: stats.totalBookings, badge: "+12% from last week", badgeColor: "text-[#4caf50] bg-[#4caf50]/10", glow: "bg-[#1565c0]/10" },
    { label: "Revenue", value: stats.revenue, badge: "+8% from last week", badgeColor: "text-[#4caf50] bg-[#4caf50]/10", glow: "bg-[#4caf50]/10" },
    { label: "Movies Showing", value: stats.moviesShowing, badge: "2 premieres this week", badgeColor: "text-[#42a5f5] bg-[#42a5f5]/10", glow: "bg-[#42a5f5]/10" },
    { label: "Users Today", value: stats.usersToday, badge: "Average traffic", badgeColor: "text-[#ffc107] bg-[#ffc107]/10", glow: "bg-[#ffc107]/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="glass-card p-5 rounded-xl border border-white/5 relative overflow-hidden">
          <div className="text-[#9e9e9e] text-[11px] font-semibold uppercase tracking-wider mb-2 truncate">{c.label}</div>
          <div className="font-display text-2xl font-bold text-white mb-2 truncate leading-tight" title={String(c.value)}>
            {c.value}
          </div>
          <div className={`text-[11px] font-medium px-2 py-1 rounded w-fit inline-flex items-center truncate max-w-full ${c.badgeColor}`}>
            {c.badge}
          </div>
          <div className={`absolute -bottom-4 -right-4 w-20 h-20 ${c.glow} rounded-full blur-xl pointer-events-none`} />
        </div>
      ))}
    </div>
  );
}
