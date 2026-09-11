'use client';

interface PaymentFooterProps {
  grandTotal: number;
  isDisabled: boolean;
  onProceed: () => void;
}

/**
 * Bottom action bar matching Figma node 544:166
 */
export default function PaymentFooter({
  grandTotal,
  isDisabled,
  onProceed,
}: PaymentFooterProps) {
  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-40 w-full bg-white border-t border-[#e5e0da] font-['Montserrat']"
      style={{
        bottom: 0,
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05), 0 50px 0 50px #ffffff",
      }}
    >
      {/* Continuous solid downward shield */}
      <div className="absolute inset-x-0 top-0 -bottom-40 bg-white -z-10 pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[480px] px-[16px] pt-2.5 pb-2 flex items-center justify-between">
        {/* Total amount on Left matching Figma node 544:167 */}
        <div className="flex flex-col gap-[2px] items-start whitespace-nowrap">
          <span className="font-normal text-[12px] text-[#6b6459] leading-[16px]">
            Total amount
          </span>
          <span className="font-bold text-[15px] text-[#211e1a] leading-[20px]">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Proceed to Payment Button on Right matching Figma node 544:170 */}
        <button
          type="button"
          onClick={onProceed}
          disabled={isDisabled}
          className="h-[50px] px-[24px] rounded-[24px] bg-[#ff5400] hover:bg-[#e04a00] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[15px] leading-[24px] flex items-center justify-center transition-all cursor-pointer shadow-xs whitespace-nowrap"
        >
          Proceed to Payment
        </button>
      </div>
    </footer>
  );
}
