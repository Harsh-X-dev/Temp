interface CancellationReasonListProps {
  selectedReason: string | null;
  onSelect: (reason: string) => void;
  otherReasonText: string;
  onOtherReasonChange: (text: string) => void;
}

const REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery is taking too long",
  "Changed my mind",
  "Item no longer needed",
  "Other",
];

export default function CancellationReasonList({
  selectedReason,
  onSelect,
  otherReasonText,
  onOtherReasonChange,
}: CancellationReasonListProps) {
  return (
    <div className="flex flex-col gap-3 px-4 lg:px-0">
      {REASONS.map((reason) => {
        const isSelected = selectedReason === reason;
        return (
          <div key={reason} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onSelect(reason)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                isSelected
                  ? "border-primary-orange bg-orange-50/30"
                  : "border-border-strong bg-white hover:bg-surface-neutral"
              }`}
            >
              <div
                className={`flex size-5 items-center justify-center rounded-full border-2 ${
                  isSelected ? "border-primary-orange" : "border-border-strong"
                }`}
              >
                {isSelected && <div className="size-2.5 rounded-full bg-primary-orange" />}
              </div>
              <span className="text-sm font-medium text-text-primary">{reason}</span>
            </button>
            
            {isSelected && reason === "Other" && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200 pl-4">
                <input
                  type="text"
                  placeholder="Please specify"
                  value={otherReasonText}
                  onChange={(e) => onOtherReasonChange(e.target.value)}
                  className="w-full rounded-lg border border-border-strong px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary-orange focus:outline-none focus: focus:-primary-orange"
                  autoFocus
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
