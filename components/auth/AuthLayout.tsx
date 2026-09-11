import Image from "next/image";
import Card from "@/components/ui/layout/Card";
import { assets } from "@/lib/assets";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] bg-primary-orange flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md rounded-2xl p-5 sm:p-8 flex flex-col gap-6 shadow-xl">
        <div className="flex justify-center">
          <img
            src={assets.logo}
            alt="GemoStone"
            width={180}
            height={46}
            className="object-contain"
          />
        </div>
        {children}
      </Card>
    </main>
  );
}
