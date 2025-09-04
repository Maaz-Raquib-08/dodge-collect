import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
  icon?: ReactNode;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default:
    "bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-border",
  primary:
    "bg-gradient-to-b from-primary/10 to-primary/5 border-primary/30",
  success:
    "bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border-emerald-500/30",
  warning:
    "bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-amber-500/30",
  danger:
    "bg-gradient-to-b from-red-500/10 to-red-500/5 border-red-500/30",
};

export function StatCard({ label, value, hint, tone = "default", className, icon }: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border shadow-brand p-5 sm:p-6",
        toneClasses[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
          ) : null}
        </div>
        {icon ? (
          <div className="shrink-0 text-primary/80">{icon}</div>
        ) : null}
      </div>
    </Card>
  );
}
