/** Hairline icons drawn on a 16px grid, matching the 1px rules used site-wide. */

type IconProps = { className?: string; size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const BedIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M1.5 12V5M1.5 8.5h13V12M14.5 12v1.5M1.5 12v1.5" />
    <path d="M4 8.5v-2h4v2" />
  </svg>
);

export const BathIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M1.5 8.5h13v1a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-1Z" />
    <path d="M3.5 8.5V4a1.5 1.5 0 0 1 3 0" />
    <path d="M4.5 12.5 4 14.5M11.5 12.5l.5 2" />
  </svg>
);

export const AreaIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="1.5" y="1.5" width="13" height="13" rx="0.5" />
    <path d="M1.5 5.5h3v-4M14.5 10.5h-3v4" />
  </svg>
);

export const PinIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M8 14.5s5-4.2 5-8a5 5 0 0 0-10 0c0 3.8 5 8 5 8Z" />
    <circle cx="8" cy="6.5" r="1.8" />
  </svg>
);

export const TrendIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M1.5 12 6 7l3 3 5.5-6.5" />
    <path d="M10.5 3.5h4v4" />
  </svg>
);

export const HeartIcon = ({
  className,
  size = 16,
  filled = false,
}: IconProps & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M8 13.7S1.8 10 1.8 5.9A3.2 3.2 0 0 1 8 4.4a3.2 3.2 0 0 1 6.2 1.5C14.2 10 8 13.7 8 13.7Z" />
  </svg>
);

export const ArrowIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...base(size)} className={`rtl-flip ${className ?? ""}`}>
    <path d="M2 8h11M9.5 4.5 13 8l-3.5 3.5" />
  </svg>
);

export const CloseIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </svg>
);

export const CalendarIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="2" y="3" width="12" height="11" rx="0.5" />
    <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
  </svg>
);
