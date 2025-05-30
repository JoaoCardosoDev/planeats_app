'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ username, email, password, confirmPassword });
    setError(''); 
    setSuccess(''); 

    if (password !== confirmPassword) {
      setError('As palavras-passe não correspondem.');
      return;
    }
    if (!username || !email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Registo efetuado com sucesso! Redirecionando para login...');
        // Clear form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          router.push('/login');
        }, 2000); // Redirect after 2 seconds
      } else {
        setError(data.detail || `Erro ${response.status}: Falha ao registar.`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Erro de conexão ou falha ao contactar o servidor.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="mb-6 text-2xl font-bold text-center">Registar</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {success && <p className="mb-4 text-green-500">{success}</p>}

        {/* Campo Nome de Utilizador */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-bold text-gray-700">Nome de Utilizador:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Campo Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Campo Palavra-passe */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-bold text-gray-700">Palavra-passe:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mb-3 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Campo Confirmar Palavra-passe */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700">Confirmar Palavra-passe:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 mb-3 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          >
            Registar
          </button>
        </div>
      </form>
    </div>
  );
}
