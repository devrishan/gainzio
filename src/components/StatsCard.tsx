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
    <Card className="relative overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl p-4 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] group">
      {/* Dynamic Background Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 bg-primary/20 blur-[50px] transition-all duration-500 group-hover:scale-150 group-hover:opacity-100 opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-primary/80 transition-colors">{title}</p>
          <p className="text-2xl sm:text-4xl font-black tracking-tight text-white italic drop-shadow-lg">
            {value}
          </p>
          {subtitle && (
            <div className="flex items-center gap-1.5">
              <p className={`text-[10px] sm:text-[11px] font-bold ${trend ? trendColors[trend] : 'text-zinc-400'} flex items-center gap-1 uppercase tracking-wider`}>
                {trend === "up" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />}
                {subtitle}
              </p>
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3 flex-shrink-0 shadow-inner group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
          <Icon className="h-5 w-5 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
        </div>
      </div>
    </Card>
  );
};

