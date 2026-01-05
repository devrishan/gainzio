import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend }: StatsCardProps) => {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-rose-500",
    neutral: "text-zinc-500",
  };

  return (
    <Card className="relative overflow-hidden border-white/5 bg-zinc-950/40 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 group">
      {/* Dynamic Background Glow */}
      <div className="absolute -right-4 -top-4 h-16 w-16 bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-black tracking-tight text-white italic">
            {value}
          </p>
          {subtitle && (
            <div className="flex items-center gap-1.5">
              <p className={`text-[10px] sm:text-[11px] font-semibold ${trend ? trendColors[trend] : 'text-zinc-400'} flex items-center gap-1`}>
                {trend === "up" && <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />}
                {subtitle}
              </p>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 flex-shrink-0 shadow-inner group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </Card>
  );
};

