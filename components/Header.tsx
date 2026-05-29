'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Ask AI', href: '/ask-ai' },
];

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground tracking-tight">
              Blih Brain
            </span>
          </Link>

          {/* Nav links */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive =
                  href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/8'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Login CTA */}
          <Button asChild size="sm" className="ml-4 shrink-0">
            <Link href="/admin/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
