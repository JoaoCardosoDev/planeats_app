// This page has been moved to /receitas-sugeridas
// Redirecting to the main recommendations page

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RecommendationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/receitas-sugeridas');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <p>Redirecionando para as receitas sugeridas...</p>
      </div>
    </div>
  );
}
