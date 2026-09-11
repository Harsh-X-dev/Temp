import Link from "next/link";
import BackButton from "@/components/ui/buttons/BackButton";

interface CancelOrderHeaderProps {
  orderNumber: string;
}

export default function CancelOrderHeader({ orderNumber }: CancelOrderHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-[58px] lg:h-auto items-center justify-between border-b border-border-strong lg:border-none bg-white px-4 lg:px-0 lg:pt-8 lg:mb-2 lg:max-w-3xl mx-auto w-full lg:static">
      <div className="flex gap-3 lg:gap-4 items-center relative">
        <BackButton href={`/orders/${orderNumber}`} className="size-10 lg:size-12 shrink-0" />
        <h1 className="text-lg lg:text-3xl font-bold text-text-primary">Cancel Order</h1>
      </div>
      
      {/* Invisible element to center the title perfectly */}
      <div className="size-10" aria-hidden="true" />
    </header>
  );
}
