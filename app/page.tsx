'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { SectionCard } from '@/components/SectionCard';
import { documentsData } from '@/lib/data';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = documentsData.map(category => ({
    ...category,
    sections: category.sections.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(section => section.items.length > 0),
  })).filter(category => category.sections.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header showNav={true} />

      {/* Search Section */}
      <section className="bg-secondary py-12 sm:py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar large={true} onSearch={setSearchQuery} />
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No documents found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map(category => (
              <SectionCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
