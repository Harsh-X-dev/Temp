import type { Metadata } from "next";
import LegalHeader from "@/components/legal/LegalHeader";
import LegalSection from "@/components/legal/LegalSection";

export const metadata: Metadata = {
  title: "Refund & Return Policy | GemoStone",
  description:
    "Read the Refund and Return Policy for GemoStone. Learn about return eligibility, order cancellations, and refund timelines.",
};

const refundData = [
  {
    title: "1. General Policy",
    content:
      "All sales are final except as explicitly stated. Since gemstones, Rudraksha, and spiritual items are sensitive and often personalized, returns are accepted only in specific cases below.",
  },
  {
    title: "2. When Return / Refund IS Accepted",
    content:
      "Damaged or broken product. Wrong item received. Missing product. Technical error resulting in double payment. Order cancelled by us (full refund). Mandatory proof: unboxing video from sealed package to product, plus photos. Claims must be reported within 48 hours of delivery.",
  },
  {
    title: "3. When Return / Refund is NOT Accepted",
    content:
      "Change of mind or dislike of colour/size/shape. Products that have been worn, used, energized on request, or customized. Claims raised after 48 hours or without unboxing video. Damage caused by mishandling after delivery.",
  },
  {
    title: "4. Order Cancellation",
    content:
      "You may cancel an order free of cost any time before it is shipped. Once shipped, an order cannot be cancelled — use the return process.",
  },
  {
    title: "5. Refund Process and Timeline",
    content:
      "Raise request at support@gemostone.com or via WhatsApp with Order ID, photos, and unboxing video. Our team reviews and responds within 2 business days. Approved refunds are processed within 5-7 business days. Replacements ship after the original is picked up/verified.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="bg-surface-subtle min-h-screen flex flex-col items-start w-full">
      {/* Header Bar */}
      <LegalHeader title="Refund & Return Policy" />

      {/* Content Container */}
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-[18px] items-start p-[18px] pb-12">
        <p className="font-sans font-medium leading-[1.5] text-text-secondary text-[11px] tracking-[-0.11px] whitespace-nowrap">
          Effective Date: 24 August 2026
        </p>

        <div className="flex flex-col gap-[20px] items-start w-full">
          {refundData.map((section) => (
            <LegalSection key={section.title} title={section.title}>
              <p>{section.content}</p>
            </LegalSection>
          ))}

          {/* Contact Us */}
          <LegalSection title="Contact Us" className="pt-[8px]">
            <p>
              If you have any questions or concerns regarding these policies,
              please reach out to us at{" "}
              <a
                href="mailto:support@astrovedansh.com"
                className="text-[#0d558a] underline underline-offset-2 hover:text-primary-orange transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                support@astrovedansh.com
              </a>
            </p>
          </LegalSection>
        </div>
      </main>
    </div>
  );
}
