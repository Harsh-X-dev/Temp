"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneStep from "@/components/auth/PhoneStep";
import OtpStep from "@/components/auth/OtpStep";
import VerificationSuccessScreen from "@/components/auth/VerificationSuccessScreen";
import InitialProfileCreationSheet from "@/components/auth/InitialProfileCreationSheet";
import AuthLayout from "@/components/auth/AuthLayout";
import { useLoginFlow } from "@/hooks/useLoginFlow";
import { useAddressForm } from "@/hooks/useAddressForm";
import { AddressFormSheet } from "@/components/checkout";
import { useAuthStore } from "@/store/auth.store";
import { createProfile, fetchProfileWithAddresses } from "@/services/profile.service";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import type { AddressFormData, CreateProfileInput } from "@/types/checkout.types";
import type { Address } from "@/components/account/types";

/**
 * Shared wrapper for the login flow using AuthLayout.
 *
 * Flow:
 *   phone → otp → (returning user with profile → redirectTo)
 *               → (new user without profile → InitialProfileCreationSheet → redirectTo)
 */
export default function LoginFlow() {
  const router = useRouter();

  const {
    step,
    phone,
    otp,
    countdown,
    isLoading,
    error,
    handlePhoneChange,
    handlePhoneSubmit,
    handleOtpChange,
    handleOtpSubmit,
    handleResend,
    redirectTo,
  } = useLoginFlow();

  const { user, setProfile, addresses, setAddresses } = useAuthStore();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleInitialProfileSubmit = async (input: CreateProfileInput) => {
    setIsSubmittingProfile(true);
    setProfileError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      await createProfile(supabase, input);

      // Re-fetch profile and addresses from Supabase in a single query
      const { profile: updatedProfile, addresses: updatedAddresses } =
        await fetchProfileWithAddresses(supabase);

      setProfile(updatedProfile);
      setAddresses(updatedAddresses);

      // Default to / unless an explicit redirect destination was provided (e.g. /checkout)
      const destination = redirectTo || "/";
      router.push(destination);
    } catch (err: any) {
      setProfileError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const addrForm = useAddressForm({
    onSaved: (newAddress: Address) => {
      setAddresses([...addresses, newAddress]);
      router.push(redirectTo);
    },
  });

  return (
    <>
      <AuthLayout>
        {step === "phone" && (
          <PhoneStep
            phone={phone}
            isLoading={isLoading}
            error={error}
            onPhoneChange={handlePhoneChange}
            onSubmit={handlePhoneSubmit}
          />
        )}

        {step === "otp" && (
          <OtpStep
            phone={phone}
            otp={otp}
            countdown={countdown}
            isLoading={isLoading}
            error={error}
            onOtpChange={handleOtpChange}
            onSubmit={handleOtpSubmit}
            onResend={handleResend}
          />
        )}

        {step === "success" && (
          <VerificationSuccessScreen
            onAddAddress={addrForm.openCreate}
            onSkip={() => router.push(redirectTo)}
          />
        )}
      </AuthLayout>

      {/* Initial Profile Creation Sheet for new users without a profile */}
      {step === "create_profile" && (
        <InitialProfileCreationSheet
          isOpen={step === "create_profile"}
          onClose={() => router.push(redirectTo)}
          userId={user?.id || ""}
          phone={phone}
          onSubmit={handleInitialProfileSubmit}
          isSubmitting={isSubmittingProfile}
        />
      )}

      {/* AddressFormSheet rendered at root level */}
      {/* <AddressFormSheet
        isOpen={addrForm.isOpen}
        onClose={addrForm.close}
        onSubmit={addrForm.submit}
        isSubmitting={addrForm.isSubmitting}
      /> */}
    </>
  );
}
