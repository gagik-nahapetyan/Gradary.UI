interface LogoIconProps {
  className?: string
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Book spine */}
      <path d="M12 7v14" />
      {/* Book pages */}
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      {/*
        Grape leaf — diagonal, stem/tail on left page, 3 lobes:
        upper-left lobe ~(9,6), center lobe ~(18,5), lower-right lobe ~(16,12)
      */}
      <path
        d="M5 15 C3 13 4 10 9 6 C10 4 12 5 14 6 C15 5 16 4 18 5 C19 6 19 8 17 8 C17 9 17 11 16 12 C15 14 12 16 7 16 C6 16 5 16 5 15 Z"
        fill="#6aaa5a"
        stroke="none"
      />
      {/* Main midrib */}
      <line x1="5" y1="15" x2="18" y2="5" stroke="white" strokeWidth="0.55" strokeLinecap="round" />
      {/* Branch vein to upper-left lobe */}
      <line x1="10" y1="11" x2="9" y2="6" stroke="white" strokeWidth="0.4" strokeLinecap="round" />
      {/* Branch vein to lower-right lobe */}
      <line x1="12" y1="9.5" x2="16" y2="12" stroke="white" strokeWidth="0.4" strokeLinecap="round" />
    </svg>
  )
}
