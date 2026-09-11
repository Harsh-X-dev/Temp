import BackButton from "@/components/ui/buttons/BackButton";

interface OrderDetailPageHeaderProps {
  title?: string;
  backHref?: string;
}

export default function OrderDetailPageHeader({
  title = "Order Tracking",
  backHref = "/orders",
}: OrderDetailPageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-[#E5E0DA] bg-white px-[16px] max-w-lg mx-auto w-full">
      <div className="flex items-center gap-4 w-full">
        <BackButton href={backHref} className="size-9 shrink-0" />
        <h1 className="text-[17px] font-bold text-[#211E1A] flex-1 text-center pr-2">{title}</h1>
      </div>
      
      {/* <button
        type="button"
        className="flex size-9 items-center justify-center rounded-full border border-[#E5E0DA] bg-white text-[#211E1A] transition-colors hover:bg-[#F5F1EA] active:scale-95 absolute right-4 lg:right-0"
        aria-label="Share order"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button> */}
    </header>
  );
}
