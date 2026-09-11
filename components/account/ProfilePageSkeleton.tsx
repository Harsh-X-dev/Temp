export default function ProfilePageSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse max-w-xl mx-auto w-full">
      {/* Identity Card Skeleton */}
      <div className="rounded-[12px] border border-border-strong bg-white p-[16px] shadow-2xs">
        <div className="flex items-center gap-[16px]">
          <div className="size-[64px] rounded-[32px] bg-[#f3ede4] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded bg-[#f3ede4]" />
            <div className="h-3 w-40 rounded bg-[#f3ede4]" />
            <div className="h-3 w-28 rounded bg-[#f3ede4]" />
          </div>
          <div className="size-8 rounded-[16px] bg-[#f3ede4] shrink-0" />
        </div>
      </div>

      {/* Addresses Card Skeleton */}
      <div className="rounded-[12px] border border-border-strong bg-white p-[16px] shadow-2xs">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-[#f3ede4]" />
          <div className="h-4 w-16 rounded bg-[#f3ede4]" />
        </div>
        <div className="flex flex-col gap-3 divide-y divide-[#e5e0da]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3 pt-3 first:pt-0">
              <div className="size-5 rounded-full bg-[#f3ede4] shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-[#f3ede4]" />
                <div className="h-3 w-full rounded bg-[#f3ede4]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Menu Skeleton */}
      <div className="rounded-[12px] border border-border-strong bg-white overflow-hidden shadow-2xs">
        <div className="flex flex-col divide-y divide-[#e5e0da]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-[16px] py-[14px]">
              <div className="flex items-center gap-[12px]">
                <div className="size-[32px] rounded-[12px] bg-[#f3ede4] shrink-0" />
                <div className="h-4 w-28 rounded bg-[#f3ede4]" />
              </div>
              <div className="size-4 rounded bg-[#f3ede4] shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Policies Skeleton */}
      <div className="rounded-[12px] border border-border-strong bg-white overflow-hidden shadow-2xs">
        <div className="flex flex-col divide-y divide-[#e5e0da]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-[16px] py-[14px]">
              <div className="flex items-center gap-[12px]">
                <div className="size-[32px] rounded-[12px] bg-[#f3ede4] shrink-0" />
                <div className="h-4 w-36 rounded bg-[#f3ede4]" />
              </div>
              <div className="size-4 rounded bg-[#f3ede4] shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Logout Skeleton */}
      <div className="h-[48px] w-full rounded-[24px] bg-[#f3ede4]" />
    </div>
  );
}
