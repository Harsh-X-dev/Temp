import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="bg-surface-subtle flex-1 flex flex-col pb-6">
      {/* Header */}
      <header className="bg-white border-b border-border-strong flex h-[56px] items-center justify-between px-[24px] shrink-0">
        {/* Left: Back button — 28×28, rounded-[14px] square */}
        <Link
          href="/profile"
          className="bg-white border border-border-strong flex flex-col items-center justify-center rounded-[14px] size-[28px] shrink-0"
          aria-label="Go back"
        >
          <svg
            className="size-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        {/* Center: Title */}
        <p className="font-bold text-[18px] leading-[24px] text-text-primary text-center whitespace-nowrap">
          Contact US
        </p>

        {/* Right spacer to center the title */}
        <div className="size-[28px] shrink-0" aria-hidden="true" />
      </header>

      {/* Content */}
      <main className="flex flex-col flex-1 gap-[16px] items-start pb-0 pt-[16px] px-[24px] w-full">
        {/* Terms & Conditions */}
        <div className="bg-white flex flex-col gap-[12px] items-start p-[16px] rounded-[12px] w-full text-[13px]">
          <p className="font-bold leading-[17px] text-text-primary w-full">
            Terms &amp; Conditions
          </p>
          <div className="font-normal text-text-secondary w-full">
            <p className="leading-[18px] mb-0">
              {`These Terms of Service ("Terms") govern your access to and use of our services. By using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.`}
            </p>
            <p className="leading-[18px] mb-0">
              We reserve the right to modify these Terms at any time. Your continued use of our services after any changes constitutes your acceptance of the revised Terms.
            </p>
            <p className="leading-[18px] mb-0">
              You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account and password, and for all activities that occur under your account.
            </p>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="bg-white flex flex-col gap-[12px] items-start p-[16px] rounded-[12px] w-full text-[13px]">
          <p className="font-bold leading-[17px] text-text-primary w-full">
            Privacy Policy
          </p>
          <div className="font-normal text-text-secondary w-full">
            <p className="leading-[18px] mb-0">
              We care about your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
            </p>
            <p className="leading-[18px] mb-0">
              We collect information you provide directly to us, such as when you create an account or contact support. We may also collect usage data to improve our services.
            </p>
            <p className="leading-[18px] mb-0">
              We do not sell your personal information. We may share information with service providers who help us operate our services, and as required by law.
            </p>
            <p className="leading-[18px] mb-0">
              You have the right to access and correct your personal information. If you have questions about our privacy practices, please contact us.
            </p>
          </div>
        </div>
        {/* Contact Us — sticky at bottom */}
        <div className="w-full mt-auto pt-4 pb-4 sticky bottom-4 z-10">
          <div className="bg-primary-orange flex flex-col gap-[10px] items-start p-[16px] rounded-[12px] w-full">
            <p className="font-bold leading-[17px] text-[13px] text-white w-full">
              Contact Us
            </p>
            <div className="flex items-center w-full">
              <div className="flex flex-1 flex-col gap-[2px] items-start leading-[17px] min-w-0 text-[13px] text-white">
                <p className="font-semibold w-full">Email</p>
                <p className="font-normal w-full">support@astrovedansh.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
