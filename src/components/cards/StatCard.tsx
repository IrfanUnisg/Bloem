import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, trend, trendValue, icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trendValue && (
            <div className="flex items-center space-x-1">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-accent" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                "text-sm font-medium",
                trend === "up" ? "text-accent" : "text-destructive"
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
