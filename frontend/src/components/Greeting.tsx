'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface UserData {
  email: string;
  username: string;
  is_active: boolean;
  id: number;
}

const Greeting: React.FC = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const fetchUserData = async () => {
        try {
          const res = await fetch('/api/me'); // This will be our Next.js API route
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Failed to fetch user data');
          }
          const data: UserData = await res.json();
          setUserData(data);
          setError(null);
        } catch (err: unknown) {
          console.error('Failed to fetch user data:', err);
          if (err instanceof Error) {
            setError(err.message || 'Could not load user details.');
            // Potentially sign out if token is invalid
            if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
               signOut({ redirect: false }); // Sign out without redirecting immediately
            }
          } else {
            setError('An unknown error occurred while fetching user data.');
          }
        }
      };
      fetchUserData();
    } else {
      setUserData(null); // Clear user data if not authenticated
    }
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="p-4 bg-gray-200 text-gray-700 rounded-lg shadow-md animate-pulse">
        <h1 className="text-2xl font-bold">Loading session...</h1>
      </div>
    );
  }

  if (status === 'authenticated' && session.user) {
    return (
      <div className="p-6 bg-green-600 text-white rounded-lg shadow-xl">
        {userData ? (
          <>
            <h1 className="text-3xl font-bold">Welcome back, {userData.username}!</h1>
            <p className="mt-2 text-lg">Your email: {userData.email}</p>
            <p className="text-sm">User ID: {userData.id}, Active: {userData.is_active ? 'Yes' : 'No'}</p>
          </>
        ) : error ? (
          <>
            <h1 className="text-3xl font-bold text-red-200">Error loading profile</h1>
            <p className="mt-2 text-lg text-red-100">{error}</p>
          </>
        ) : (
          <h1 className="text-3xl font-bold">Loading user data...</h1>
        )}
        <button
          onClick={() => signOut()}
          className="mt-4 px-4 py-2 font-semibold text-green-700 bg-white rounded hover:bg-gray-100 transition duration-150"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-500 text-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold">Hello, Guest!</h1>
      <p className="mt-2 text-lg">Please sign in to access your personalized dashboard.</p>
      <button
        onClick={() => signIn()}
        className="mt-4 px-4 py-2 font-semibold text-blue-700 bg-white rounded hover:bg-gray-100 transition duration-150"
      >
        Sign In
      </button>
    </div>
  );
};

export default Greeting;
