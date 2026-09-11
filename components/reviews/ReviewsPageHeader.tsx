import BackButton from "@/components/ui/buttons/BackButton";
import CartButton from "@/components/ui/buttons/CartButton";
import WishlistButton from "@/components/ui/buttons/WishlistButton";

export default function ReviewsPageHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[58px] items-center justify-between border-b border-border-strong bg-white px-[16px] max-w-lg mx-auto w-full">
      <div className="flex gap-3 items-center relative">
        <BackButton href="/profile" className="size-9 shrink-0" />
        <h1 className="text-[18px] font-bold text-text-primary">My Reviews</h1>
      </div>
      <div className="flex items-center gap-2">
        <WishlistButton
          className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-white hover:bg-surface-neutral active:scale-95 relative text-text-primary"
          iconClassName="size-5"
        />
        <CartButton
          className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-white hover:bg-surface-neutral active:scale-95 relative text-text-primary"
          iconClassName="size-5"
        />
      </div>
    </header>
  );
}
