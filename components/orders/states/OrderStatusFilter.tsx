interface OrderStatusFilterProps {
  statuses: string[];
  selectedStatus: string;
  onSelect: (status: string) => void;
}

export default function OrderStatusFilter({
  statuses,
  selectedStatus,
  onSelect,
}: OrderStatusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-[16px] px-[16px]">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onSelect(status)}
          className={`shrink-0 h-8 flex items-center px-[14px] rounded-[18px] text-[12px] font-semibold leading-normal whitespace-nowrap transition-colors ${
            selectedStatus === status
              ? "bg-[#ff5400] text-white border-transparent"
              : "bg-white border border-[#e5e0da] text-[#6b6459] hover:border-[#a89a85]"
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
