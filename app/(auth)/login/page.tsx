import { Suspense } from "react";
import LoginFlow from "@/components/auth/LoginFlow";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LoginFlow />
    </Suspense>
  );
}
