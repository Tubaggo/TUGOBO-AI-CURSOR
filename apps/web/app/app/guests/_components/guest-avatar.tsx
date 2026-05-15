import { cn } from "@/lib/utils";
import { guestInitials } from "./guest-formatters";

type GuestAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-[11px]",
  lg: "h-14 w-14 text-sm",
};

export function GuestAvatar({ name, size = "md", className }: GuestAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-violet-500/25 bg-gradient-to-br from-violet-500/25 to-zinc-800 font-semibold text-violet-100",
        sizeClasses[size],
        className
      )}
      aria-hidden
    >
      {guestInitials(name)}
    </div>
  );
}
