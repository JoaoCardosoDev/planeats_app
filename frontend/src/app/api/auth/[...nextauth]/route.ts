import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Define a type for the user object returned by your backend
interface BackendUser {
  id: number;
  email: string;
  username: string;
  access_token: string;
  token_type: string;
}

// Define a type for the session user, extending NextAuthUser
interface SessionUser extends NextAuthUser {
  id: string; // Changed from number to string to match NextAuthUser
  username: string;
  accessToken?: string;
  userIdNum?: number; // Optional: if you need the numeric ID elsewhere
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        try {
          const res = await fetch(`${backendUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Authentication failed');
          }

          const user: BackendUser = await res.json();

          if (user && user.access_token) {
            // Return an object that NextAuth.js can use.
            // We'll store the full backend user object (including token) here,
            // and then transfer necessary parts to the JWT and session callbacks.
            return {
              id: user.id.toString(), // NextAuth expects id as string
              email: user.email,
              name: user.username, // 'name' is a standard field NextAuth looks for
              // Store the backend user object to pass to JWT callback
              backendUser: user,
            } as NextAuthUser & { backendUser: BackendUser };
          } else {
            return null;
          }
        } catch (error: unknown) {
          console.error("Authorize error:", error);
          if (error instanceof Error) {
            throw new Error(error.message || 'Failed to authenticate with backend');
          }
          throw new Error('An unknown error occurred during authentication');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Use JSON Web Tokens for session management
  },
  callbacks: {
    async jwt({ token, user }) { // Removed account: _account
      // 'user' is only passed on initial sign-in.
      // 'account' is only passed on initial sign-in with an OAuth provider.
      // For credentials provider, 'user' will contain what we returned from 'authorize'.
      if (user) {
        // On sign-in, 'user' contains the backendUser object we attached in 'authorize'
        const typedUser = user as NextAuthUser & { backendUser: BackendUser };
        const backendUser = typedUser.backendUser;
        if (backendUser) {
          token.accessToken = backendUser.access_token;
          token.userId = backendUser.id; // This will be the numeric ID
          token.username = backendUser.username;
          token.email = backendUser.email; // Ensure email is in the token
          token.id = backendUser.id.toString(); // Ensure string id is in token for session.user.id
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user ID from the token.
      if (session.user) {
        if (token.accessToken) {
          (session.user as SessionUser).accessToken = token.accessToken as string;
        }
        if (token.id) { // This is the string version from token
          (session.user as SessionUser).id = token.id as string;
        }
        if (token.userId) { // This is the numeric ID
             (session.user as SessionUser).userIdNum = token.userId as number;
        }
        if (token.username) {
          (session.user as SessionUser).username = token.username as string;
        }
        if (token.email) {
          session.user.email = token.email as string; // Ensure email is in the session
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error', // Custom error page (optional)
  },
  // secret: process.env.NEXTAUTH_SECRET, // Already set via environment variables
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
