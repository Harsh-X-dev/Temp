import type { Metadata } from "next";
import LegalHeader from "@/components/legal/LegalHeader";
import LegalSection from "@/components/legal/LegalSection";

export const metadata: Metadata = {
  title: "Privacy Policy | GemoStone",
  description:
    "Read the Privacy Policy for GemoStone. Learn how we collect, use, protect, and handle your personal data and privacy rights.",
};

const privacyData = [
  {
    title: "1. Commitment to Privacy",
    content:
      "At Gemostone, your trust is our highest priority. We are committed to protecting your personal information and respecting your privacy rights.",
  },
  {
    title: "2. Information We Collect",
    content:
      "Personal Data (name, mobile number, shipping address, email, date of birth or Rashi). Order & Payment Data. Derivative Data (IP address, browser type, access times). Cookies & Session Data.",
  },
  {
    title: "3. Use of Your Information",
    content:
      "Create and manage your account. Process orders, payments, deliveries, and refunds. Send OTPs, order updates, and service messages. Recommend products. Send offers and newsletters (with consent).",
  },
  {
    title: "4. Disclosure of Your Information",
    content:
      "Service Providers (payment gateways, courier partners, SMS/OTP providers). By Law or to Protect Rights. We never sell your personal information.",
  },
  {
    title: "5. Data Security",
    content: "We use HTTPS encryption, secure servers, and restricted access.",
  },
  {
    title: "6. Your Rights",
    content:
      "Access and update profile information. Request account deletion. Opt out of promotional communication.",
  },
  {
    title: "7. Children's Privacy",
    content: "Our services are not directed to children under 18.",
  },
  {
    title: "8. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface-subtle min-h-screen flex flex-col items-start w-full">
      {/* Header Bar */}
      <LegalHeader title="Privacy Policy" />

      {/* Content Container */}
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-[18px] items-start p-[18px] pb-12">
        <p className="font-sans font-medium leading-[1.5] text-text-secondary text-[11px] tracking-[-0.11px] whitespace-nowrap">
          Effective Date: 24 August 2026
        </p>

        <div className="flex flex-col gap-[20px] items-start w-full">
          {privacyData.map((section) => (
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
