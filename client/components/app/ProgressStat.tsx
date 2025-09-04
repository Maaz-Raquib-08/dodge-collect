import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressStatProps {
  label: string;
  value: number; // 0-100
}

export function ProgressStat({ label, value }: ProgressStatProps) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <Card className="rounded-2xl border bg-gradient-to-b from-secondary/60 to-secondary/30 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium text-foreground">{safe}%</div>
      </div>
      <div className="mt-3">
        <Progress
          value={safe}
          className="h-3 overflow-hidden rounded-full bg-secondary shadow-inner"
        />
      </div>
    </Card>
  );
}
