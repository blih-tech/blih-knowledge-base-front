'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  large?: boolean;
}

export function SearchBar({ onSearch, large = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  if (large) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            value={query}
            onChange={handleChange}
            className="pl-12 py-6 bg-white border-0 text-base rounded-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search"
        value={query}
        onChange={handleChange}
        className="pl-10 bg-white border border-border rounded-md"
      />
    </div>
  );
}
