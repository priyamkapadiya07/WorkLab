import { cn } from "./Button";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--color-muted)]", className)}
      {...props}
    />
  );
}

export { Skeleton };
