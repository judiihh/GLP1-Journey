import { cn } from "@/lib/cn";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 6,
  color = "#a892d4",
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f0ecf8"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-sm font-semibold text-gray-800">{label}</span>
        )}
        {sublabel && (
          <span className="text-[10px] text-gray-500">{sublabel}</span>
        )}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  unit?: string;
}

export function ProgressBar({
  value,
  max,
  color = "bg-lavender-400",
  label,
  showValue,
  unit = "",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-gray-600">{label}</span>}
          {showValue && (
            <span className="text-gray-800 font-medium">
              {value}{unit} / {max}{unit}
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 bg-rose-50/80 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
