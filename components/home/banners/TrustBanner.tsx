export default function TrustBanner() {
  return (
    <section aria-label="Trust Signals" className="w-full">
      <div className="flex w-full items-center justify-between border-y border-border-strong bg-surface-subtle px-4 py-4 md:px-10 lg:px-20">
        {/* Lab-Certified */}
        <div className="flex flex-1 flex-col items-center gap-1.5 px-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary-orange"
          >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
          <p className="text-[11px] font-semibold text-text-primary md:text-[13px]">
            Lab-Certified
          </p>
        </div>

        {/* Hand-Selected */}
        <div className="flex flex-1 flex-col items-center gap-1.5 px-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary-orange"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M15 14v-2a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v5" />
            <path d="M18 11.5a2.5 2.5 0 0 1 5 0v3.5a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
          <p className="text-[11px] font-semibold text-text-primary md:text-[13px]">
            Hand-Selected
          </p>
        </div>

        {/* Energized */}
        <div className="flex flex-1 flex-col items-center gap-1.5 px-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary-orange"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
          </svg>
          <p className="text-[11px] font-semibold text-text-primary md:text-[13px]">
            Energized
          </p>
        </div>
      </div>
    </section>
  );
}
