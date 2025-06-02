'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>A carregar...</p>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-md">
        <p>
          Olá, {session.user?.name || session.user?.email || 'Utilizador'}!
        </p>
        <Button
          onClick={() => signOut({ callbackUrl: '/login' })}
          variant="outline"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-md">
      <p>Não está autenticado.</p>
      <Link href="/login" passHref>
        <Button variant="default">Login</Button>
      </Link>
      <Link href="/register" passHref>
        <Button variant="secondary">Registar</Button>
      </Link>
    </div>
  );
}
