"use client";

import Button from "@/components/ui/buttons/Button";

interface VerificationSuccessScreenProps {
  onAddAddress: () => void;
  onSkip: () => void;
}

export default function VerificationSuccessScreen({
  onAddAddress,
  onSkip,
}: VerificationSuccessScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 animate-[fadeInUp_0.3s_ease-out]">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary-orange">
        <svg
          className="size-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-xl font-bold text-text-primary">
          Verification Successful!
        </h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Your mobile number has been verified.<br />
          Please add your delivery address to start shopping your lucky gems.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full mt-2">
        <Button
          type="button"
          onClick={onAddAddress}
          variant="filled"
          size="lg"
          className="w-full h-14 rounded-xl text-base font-semibold"
        >
          Add Address +
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-sm font-medium text-text-muted underline underline-offset-2 hover:text-text-primary transition-colors py-2 cursor-pointer"
        >
          Skip to Homepage
        </button>
      </div>
    </div>
  );
}
