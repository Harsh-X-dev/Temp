"use client";

import { ReactNode } from "react";

/* ─── TEMPORARILY DISABLED — diagnostic test ──────────────────────────────
 * Original template wraps every page in a CSS entry animation using
 * template.tsx's per-navigation remount behaviour (by design in Next.js).
 * That remount was causing WishlistPage to lose all local state and
 * re-trigger the Supabase `products` fetch on every visit.
 *
 * To restore: delete the pass-through export below and un-comment this block.
 *
 * export default function Template({ children }: { children: ReactNode }) {
 *   return (
 *     <div className="animate-page-in">
 *       {children}
 *     </div>
 *   );
 * }
 * ─────────────────────────────────────────────────────────────────────────*/

// Temporary pass-through — no animation wrapper, no per-navigation remount.
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
