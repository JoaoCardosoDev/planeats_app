'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, preencha o email e a password.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast({
          title: 'Erro de Login',
          description: result.error === 'CredentialsSignin' ? 'Email ou password incorretos.' : 'Ocorreu um erro. Tente novamente.',
          variant: 'destructive',
        });
      } else if (result?.ok) {
        toast({
          title: 'Login Bem-Sucedido!',
          description: 'A ser redirecionado...',
        });
        router.push('/meu-frigorifico'); // Or any other desired page
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro inesperado durante o login. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Aceda à sua conta PlanEats
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="seuemail@exemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="********"
            />
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'A carregar...' : 'Entrar'}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Não tem conta?{' '}
          <a href="/register" className="font-medium text-green-600 hover:text-green-500">
            Registe-se aqui
          </a>
        </p>
      </div>
    </div>
  );
}
