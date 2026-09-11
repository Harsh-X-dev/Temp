export default function GetInTouch() {
  return (
    <section aria-label="Get in touch" className="w-full bg-primary-orange">
      <div className="flex w-full flex-col gap-2 bg-primary-orange px-6 pt-7 pb-20 md:pb-7 md:px-10 lg:px-20 shadow-sm">
        <h2 className="text-[16px] font-bold text-white md:text-[18px]">
          Need help?
        </h2>

        <div className="flex flex-col gap-3">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] text-white shrink-0"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <a
              href="tel:+919876543210"
              className="text-[14px] font-medium text-white hover:underline md:text-[15px]"
            >
              +91 98765 43210
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] text-white shrink-0"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <a
              href="mailto:support@astrovedansh.com"
              className="text-[14px] font-medium text-white hover:underline md:text-[15px]"
            >
              support@astrovedansh.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
