import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border border-lavender-100 bg-white/70",
          "focus:outline-none focus:ring-2 focus:ring-lavender-300/80 focus:border-rose-200 focus:shadow-[0_0_0_1px_rgba(235,177,203,0.45)]",
          "placeholder:text-gray-400 transition-all",
          error && "border-rose-300 focus:ring-rose-300",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border border-lavender-100 bg-white/70",
          "focus:outline-none focus:ring-2 focus:ring-lavender-300/80 focus:border-rose-200 focus:shadow-[0_0_0_1px_rgba(235,177,203,0.45)]",
          "transition-all appearance-none cursor-pointer",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border border-lavender-100 bg-white/70",
          "focus:outline-none focus:ring-2 focus:ring-lavender-300/80 focus:border-rose-200 focus:shadow-[0_0_0_1px_rgba(235,177,203,0.45)]",
          "placeholder:text-gray-400 transition-all resize-none",
          className
        )}
        {...props}
      />
    </div>
  );
}
