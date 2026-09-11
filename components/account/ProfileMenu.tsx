import Link from "next/link";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  {
    label: "Order History",
    href: "/orders",
    icon: (
      <svg
        className="size-[18px] text-text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    label: "My Reviews",
    href: "/profile/reviews",
    icon: (
      <svg
        className="size-[18px] text-text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    ),
  },
  {
    label: "My Wishlist",
    href: "/wishlist",
    icon: (
      <svg
        className="size-[18px] text-text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-6.75 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
        />
      </svg>
    ),
  },
];

export default function ProfileMenu() {
  return (
    <div className="rounded-[12px] border border-border-strong bg-white overflow-hidden shadow-2xs">
      <div className="flex flex-col divide-y divide-[#e5e0da]">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            prefetch={true}
            className="flex items-center justify-between px-[16px] py-[14px] transition-colors hover:bg-surface-subtle active:bg-[#f3ede4]"
          >
            <div className="flex items-center gap-[12px]">
              <div className="flex size-[32px] items-center justify-center rounded-[12px] shrink-0 bg-surface-subtle">
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
