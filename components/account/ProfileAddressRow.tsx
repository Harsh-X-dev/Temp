import type { Address } from "./types";

interface ProfileAddressRowProps {
  address: Address;
  fullName?: string | null;
  isSaving: boolean;
  onSetDefault: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProfileAddressRow({
  address,
  fullName,
  isSaving,
  onSetDefault,
  onEdit,
  onDelete,
}: ProfileAddressRowProps) {
  const recipientName = address.fullName || fullName;
  const recipientPhone = address.phone;

  const addressParts = [
    recipientName,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ].filter(Boolean);

  const fullAddress = addressParts.join(", ");

  const typeLabel = address.addressType
    ? address.addressType.charAt(0).toUpperCase() + address.addressType.slice(1)
    : "Address";

  const displayTitle = `${typeLabel}${address.isDefault ? " (Default)" : ""}`;

  return (
    <div className="flex gap-[12px] items-start py-[12px] first:pt-0 last:pb-0">
      <div className="pt-0.5 shrink-0">
        <button
          type="button"
          onClick={() => !address.isDefault && onSetDefault(address.id)}
          disabled={isSaving || address.isDefault}
          className={`flex size-[20px] items-center justify-center rounded-full border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-orange focus-visible:ring-offset-1 ${
            address.isDefault
              ? "border-primary-orange bg-white"
              : "border-border-strong bg-white hover:border-primary-orange"
          }`}
          aria-label={address.isDefault ? "Current default address" : "Set as default address"}
        >
          {address.isDefault && (
            <span className="size-[9px] rounded-full bg-primary-orange" />
          )}
        </button>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
        <p className="text-[13px] font-semibold text-text-primary leading-normal">
          {displayTitle}
        </p>
        <p className="text-[12px] font-normal leading-[18px] text-text-secondary pr-2">
          {fullAddress}
        </p>
        {recipientPhone && (
          <p className="text-[11px] font-normal text-text-muted">
            Phone: {recipientPhone}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end justify-start gap-[4px] shrink-0 whitespace-nowrap pt-0.5">
        <button
          type="button"
          onClick={() => onEdit(address.id)}
          disabled={isSaving}
          className="text-[11px] font-semibold text-primary-orange hover:underline disabled:opacity-50 cursor-pointer"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(address.id)}
          disabled={isSaving}
          className="text-[11px] font-semibold text-text-muted hover:text-red-500 hover:underline disabled:opacity-50 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
