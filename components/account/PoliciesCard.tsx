import Link from "next/link";

interface PolicyItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const policyItems: PolicyItem[] = [
  {
    label: "Terms & Conditions",
    href: "/terms-and-conditions",
    icon: (
      <svg
        className="size-[20px] text-[#6B6359]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
    icon: (
      <svg
        className="size-[20px] text-[#6B6359]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    label: "Refund & Return Policy",
    href: "/refund-policy",
    icon: (
      <svg
        className="size-[20px] text-[#6B6359]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    ),
  },
];

export default function PoliciesCard() {
  return (
    <div className="rounded-[12px] border border-border-strong bg-white overflow-hidden shadow-2xs">
      <div className="flex flex-col divide-y divide-[#e5e0da]">
        {policyItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center justify-between px-[16px] py-[14px] transition-colors hover:bg-surface-subtle active:bg-[#f3ede4]"
          >
            <div className="flex items-center gap-[12px]">
              <div className="flex size-[32px] items-center justify-center rounded-[12px] shrink-0">
                {item.icon}
              </div>
              <span className="text-[13px] font-semibold text-text-primary">{item.label}</span>
            </div>
            <svg
              className="size-[18px] text-[#6B6359] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
