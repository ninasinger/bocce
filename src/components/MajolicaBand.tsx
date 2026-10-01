// A strip of hand-painted majolica tiles: cobalt diamond, lemon center,
// leaf-green corners. Every instance shares one pattern id; identical
// duplicate defs are harmless.
export function MajolicaBand({ className = "" }: { className?: string }) {
  return (
    <svg className={`block h-6 w-full ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="majolica-tile" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#FFFFFF" />
          <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="#1E4E9C" />
          <path d="M12 7 L17 12 L12 17 L7 12 Z" fill="#FFFFFF" />
          <circle cx="12" cy="12" r="2.5" fill="#F2C230" />
          <circle cx="0" cy="0" r="3.5" fill="#4C7A34" />
          <circle cx="24" cy="0" r="3.5" fill="#4C7A34" />
          <circle cx="0" cy="24" r="3.5" fill="#4C7A34" />
          <circle cx="24" cy="24" r="3.5" fill="#4C7A34" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#majolica-tile)" />
    </svg>
  );
}
