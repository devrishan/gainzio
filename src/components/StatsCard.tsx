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
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="border-border bg-card p-3 sm:p-4 transition-all hover:border-primary/50">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className={`text-[10px] sm:text-xs ${trend ? trendColors[trend] : 'text-muted-foreground'} truncate`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 flex-shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
};
