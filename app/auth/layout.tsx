// Auth pages are fully public — no session guard here.
// The login page itself handles session redirects.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
