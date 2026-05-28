import { withAuth } from "next-auth/middleware";

export default withAuth(
  // No custom middleware logic — withAuth handles the redirect itself.
  function middleware() {},
  {
    pages: { signIn: "/admin" },
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        // Login page is public.
        if (pathname === "/admin") return true;
        // Everything else under /admin requires an authenticated admin.
        if (pathname.startsWith("/admin")) {
          return !!token && token.role === "admin";
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"],
};
