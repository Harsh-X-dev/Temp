import BackButton from "@/components/ui/buttons/BackButton";

export default function OrdersPageHeader() {

  return (
    <header className="bg-white border-b border-[#e5e0da] flex h-[56px] items-center px-[16px] shrink-0 w-full">
      <div className="flex items-center gap-4">
        <BackButton href="/profile" />
        <h1 className="text-[18px] font-bold text-[#211e1a] whitespace-nowrap leading-normal">
          Order History
        </h1>
      </div>
    </header>
  );
}
