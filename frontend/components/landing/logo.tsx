export function LandingLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {/* Terminal prompt icon — matches statmux brand identity */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          width="28"
          height="28"
          rx="7"
          fill="#14151a"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        {/* > caret */}
        <path
          d="M8 10l5 4-5 4"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* _ blinking cursor bar */}
        <rect x="16" y="17" width="6" height="1.8" rx="0.9" fill="#34d399" opacity="0.7" />
      </svg>
      <span
        className="text-lg font-semibold tracking-tight"
        style={{
          fontFamily: 'var(--font-geist-mono, monospace)',
          color: '#f4f4f5',
        }}
      >
        stat<span style={{ color: '#34d399' }}>mux</span>
      </span>
    </span>
  )
}
