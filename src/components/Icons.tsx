import React from 'react';

// SPEC REQUIREMENT: "Ticks and crosses are inline SVG, not emoji, not icon fonts."

export function ConfirmedIcon({ className = 'w-5 h-5 text-emerald-400' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Confirmed commitment"
    >
      <polyline points="4 10 8 14 16 6" />
    </svg>
  );
}

export function AbsentIcon({ className = 'w-5 h-5 text-zinc-500' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Absent commitment"
    >
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  );
}

export function UnverifiedIcon({ className = 'w-5 h-5 text-amber-400' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Unverified commitment"
    >
      <circle cx="10" cy="10" r="8" strokeWidth="2" />
      <path d="M8.5 8a2 2 0 1 1 3 1.7c-.5.4-.8.7-.8 1.3v.5" />
      <circle cx="10.5" cy="14" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function KeyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2l-2 2m-1.5 1.5L14 9a5 5 0 1 0 3 3l5-5-2-2-2.5 2.5z" />
      <circle cx="7.5" cy="15.5" r="1.5" />
    </svg>
  );
}

export function DocumentIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-2.7-6.3l-2.1 2.1m-8.4 8.4l-2.1 2.1m0-12.6l2.1 2.1m8.4 8.4l2.1 2.1" />
    </svg>
  );
}

export function SpinnerIcon({ className = 'w-5 h-5 animate-spin' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}
