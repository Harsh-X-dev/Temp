import Card from "@/components/ui/layout/Card";
import { assets } from "@/lib/assets";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full bg-primary-orange flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Fixed background to completely prevent white under/overscroll on mobile browsers */}
      <div className="fixed inset-0 bg-primary-orange -z-10 pointer-events-none" aria-hidden="true" />
      <main className="w-full flex items-center justify-center my-auto">
        <Card className="w-full max-w-md rounded-2xl p-5 sm:p-8 flex flex-col gap-6 shadow-xl bg-white">
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
    </div>
  );
}
