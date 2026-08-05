import { cn } from "@/lib/cn";
import { ui } from "@/lib/ui-classes";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-lavender-50/80 p-4 sm:p-5",
        onClick && "cursor-pointer hover:shadow-rose hover:border-rose-100 transition-all",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4 flex-col sm:flex-row sm:items-start">
      <div className="min-w-0">
        <h3 className="font-display font-semibold text-gray-800 text-lg">{title}</h3>
        <div className={cn(ui.titleUnderline, "mt-2 mb-1")} />
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
