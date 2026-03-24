import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    const variants = {
      primary: "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:-translate-y-0.5",
      secondary: "bg-secondary text-white hover:bg-pink-600 shadow-lg shadow-secondary/30 hover:-translate-y-0.5",
      outline: "border border-border bg-transparent hover:bg-zinc-100 text-foreground dark:hover:bg-zinc-800",
      ghost: "bg-transparent hover:bg-zinc-100 text-foreground dark:hover:bg-zinc-800"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
