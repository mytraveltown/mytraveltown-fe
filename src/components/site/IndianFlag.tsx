import { cn } from "@/lib/utils";

type IndianFlagProps = {
  className?: string;
  /** Accessible label; pass an empty string when the flag is purely decorative. */
  title?: string;
};

/** Inline SVG of the Indian national flag (3:2). Used instead of the emoji, which Windows does not render. */
export function IndianFlag({ className, title = "Indian flag" }: IndianFlagProps) {
  const isDecorative = title === "";
  return (
    <svg
      viewBox="0 0 30 20"
      className={cn("inline-block h-3 w-[18px] rounded-[2px] shadow-sm", className)}
      role={isDecorative ? undefined : "img"}
      aria-hidden={isDecorative || undefined}
      aria-label={isDecorative ? undefined : title}
    >
      <rect width="30" height="20" fill="#FFFFFF" />
      <rect width="30" height="6.67" fill="#FF9933" />
      <rect y="13.33" width="30" height="6.67" fill="#138808" />
      <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.5" />
      <circle cx="15" cy="10" r="0.5" fill="#000080" />
      {Array.from({ length: 24 }, (_, i) => (
        <line
          key={i}
          x1="15"
          y1="10"
          x2="15"
          y2="7.4"
          stroke="#000080"
          strokeWidth="0.2"
          transform={`rotate(${i * 15} 15 10)`}
        />
      ))}
    </svg>
  );
}
