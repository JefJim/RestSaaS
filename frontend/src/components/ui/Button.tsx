import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    const variants = {
      primary: "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:-translate-y-0.5",
      secondary: "bg-secondary text-white hover:bg-pink-600 shadow-lg shadow-secondary/30 hover:-translate-y-0.5",
      outline: "border border-border bg-transparent hover:bg-zinc-100 text-foreground dark:hover:bg-zinc-800",
      ghost: "bg-transparent hover:bg-zinc-100 text-foreground dark:hover:bg-zinc-800"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-5 py-3 text-sm rounded-xl",
      lg: "px-8 py-4 text-base rounded-2xl"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size as keyof typeof sizes]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
