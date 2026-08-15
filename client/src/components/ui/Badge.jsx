import { cn } from "./Button";

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-white/10 text-white border border-white/20",
    secondary: "bg-[var(--color-secondary)]/30 text-[var(--color-muted-foreground)] border border-[var(--color-secondary)]",
    destructive: "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] border border-[var(--color-destructive)]/30",
    outline: "border border-[var(--color-border)] text-[var(--color-foreground)]",
    success: "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
