'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  return (
    <header className="bg-white border-b border-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-accent" />
            <span className="text-xl font-semibold text-foreground">Blih Brain</span>
          </Link>

          {showNav && (
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-foreground hover:text-accent transition-colors">
                Our Website
              </Link>
              <Link href="/faq" className="text-foreground hover:text-accent transition-colors">
                FAQ
              </Link>
              <Link href="/ask-ai" className="text-foreground hover:text-accent transition-colors">
                Ask AI
              </Link>
            </nav>
          )}

          <Button variant="default" className="ml-auto md:ml-0 bg-foreground hover:bg-foreground/90">
            Login
          </Button>
        </div>
      </div>
    </header>
  );
}
