import type { Metadata } from "next";
import LegalHeader from "@/components/legal/LegalHeader";
import LegalSection from "@/components/legal/LegalSection";

export const metadata: Metadata = {
  title: "Terms & Conditions | GemoStone",
  description:
    "Read the Terms and Conditions for GemoStone. Learn about our services, user responsibilities, order processing, shipping, and policies.",
};

const termsData = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By using Gemostone, you acknowledge that you have read, understood, and consent to comply with these Terms and our Privacy Policy. If you do not agree to these Terms or the Privacy Policy, please refrain from using the platform.",
  },
  {
    title: "2. Services and Products Provided",
    content:
      "Gemostone offers: Browsing and purchasing gemstones, Rudraksha, malas, bracelets, yantras, silver items, Shankh, puja essentials, and related spiritual products. Optional value-added services such as certification and energization (Siddhi/Abhishek) of products, where offered. Accessing product information, guides, and recommendations (including Rashi/zodiac-based suggestions).",
  },
  {
    title: "3. User Eligibility and Responsibility",
    content:
      "Users must be at least 18 years old or have parental consent. You agree to provide accurate, current, and complete information. Login is via mobile number and OTP. Users are responsible for maintaining the confidentiality of their account.",
  },
  {
    title: "4. Orders, Payment and Pricing",
    content:
      "Users can purchase products through UPI, cards, net banking, wallets, or Cash on Delivery. All payments are securely processed using our payment gateway partners; we do not store your card details. All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. An order is confirmed only after successful payment (or COD confirmation).",
  },
  {
    title: "5. Shipping and Delivery",
    content:
      "We ship across India through reputed courier partners. Estimated delivery timelines are shown at checkout. Risk of loss passes to you upon delivery. Please record an unboxing video.",
  },
  {
    title: "6. Product Information and Spiritual Disclaimer",
    content:
      "Product images are for representation; natural gemstones may have minor variations. Certificates are provided where mentioned. Astrological, spiritual, or healing benefits are for informational purposes only.",
  },
  {
    title: "7. Intellectual Property",
    content:
      "All content on Gemostone is protected by intellectual property laws.",
  },
  {
    title: "8. User-Generated Content",
    content:
      "By submitting content (reviews, ratings, photos), users grant us a non-exclusive, royalty-free license to use such content.",
  },
  {
    title: "9. Limitation of Liability",
    content: "Gemostone is provided 'as is' without warranties of any kind.",
  },
  {
    title: "10. Termination",
    content:
      "We reserve the right to suspend or terminate user access at our discretion.",
  },
  {
    title: "11. Governing Law",
    content:
      "These Terms are governed by the laws of India. Jurisdiction: courts in New Delhi.",
  },
  {
    title: "12. Changes to Terms",
    content: "We reserve the right to modify these Terms at any time.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-surface-subtle min-h-screen flex flex-col items-start w-full">
      {/* Header Bar */}
      <LegalHeader title="Terms & Conditions" />

      {/* Content Container */}
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-[18px] items-start p-[18px] pb-12">
        <p className="font-sans font-medium leading-[1.5] text-text-secondary text-[11px] tracking-[-0.11px] whitespace-nowrap">
          Effective Date: 24 August 2026
        </p>

        <div className="flex flex-col gap-[20px] items-start w-full">
          {termsData.map((section) => (
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
