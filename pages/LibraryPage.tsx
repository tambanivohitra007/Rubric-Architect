import React from 'react';
import { RubricLibrary } from '../components/library/RubricLibrary';

export function LibraryPage() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RubricLibrary />
    </main>
  );
}
