import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Aethera monogram — geometric "A" formed by clean intersecting lines.
 * Uses the brand gradient (primary → primary-glow / channel-instagram).
 */
export const Logo = ({ className, size = 28 }: LogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Aethera"
    >
      <defs>
        <linearGradient id="aethera-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--channel-instagram))" />
        </linearGradient>
      </defs>

      {/* Outer triangle (A) */}
      <path
        d="M20 4 L36 36 L31 36 L20 14 L9 36 L4 36 Z"
        fill="url(#aethera-gradient)"
      />
      {/* Inner crossbar */}
      <rect x="13" y="25" width="14" height="3" rx="0.5" fill="url(#aethera-gradient)" />
      {/* Inner stroke detail */}
      <path
        d="M20 14 L20 4"
        stroke="url(#aethera-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};
