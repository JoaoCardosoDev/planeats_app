'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function MeuFrigorificoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) router.push('/login'); // Redirect if not authenticated
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    // You can render a loading spinner or null here
    return <p>A carregar ou a redirecionar...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meu Frigorífico</h1>
      <p>Bem-vindo à sua página protegida, {session.user?.name || session.user?.email}!</p>
      <p>Aqui poderá gerir os seus ingredientes.</p>
      {/* Conteúdo da página do frigorífico aqui */}
    </div>
  );
}
