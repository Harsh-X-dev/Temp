/**
 * Auth layout — wraps authentication pages (login, register, etc.).
 * Intentionally renders no Navbar or BottomNav.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-primary-orange flex flex-col">
      {children}
    </div>
  );
}
