import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

/**
 * Shop layout — wraps storefront pages (home, collections, wishlist).
 * Provides the shared Navbar and BottomNav.
 */
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-clip bg-surface-subtle">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className="flex flex-col flex-1 w-full max-w-full overflow-x-clip">
        {children}
      </main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
