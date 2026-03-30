import { Calendar, CheckCircle, Clock, Users } from "lucide-react";

interface DoctorStatsProps {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

const DoctorStats = ({ total, upcoming, completed, cancelled }: DoctorStatsProps) => {
  const stats = [
    { label: "Total Appointments", value: total, icon: Users, color: "text-primary" },
    { label: "Upcoming", value: upcoming, icon: Clock, color: "text-accent" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "text-[hsl(var(--success))]" },
    { label: "Cancelled", value: cancelled, icon: Calendar, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-panel rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctorStats;
