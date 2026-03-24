import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <input
          ref={ref}
          className={`h-12 w-full rounded-xl border bg-background/50 px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-black/50 ${
            error ? "border-red-500" : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-primary"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
