import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as necessary

interface SessionUser {
  accessToken?: string;
  // Add other properties from your session user type if needed
}

export async function GET() { // Removed _request parameter
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as SessionUser)?.accessToken) {
    return NextResponse.json({ detail: 'Not authenticated or no access token' }, { status: 401 });
  }

  const token = (session.user as SessionUser).accessToken;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('API /me route error:', error);
    return NextResponse.json({ detail: 'An unexpected error occurred while fetching user data from backend' }, { status: 500 });
  }
}
