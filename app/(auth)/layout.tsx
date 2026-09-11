/**
 * Auth layout — wraps authentication pages (login, register, etc.).
 * Intentionally renders no Navbar or BottomNav.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
