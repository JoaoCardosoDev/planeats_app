import { NextAuthOptions, User, Account, Profile, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

// Define a type for the user object returned by the backend
interface BackendUser {
  id: number; // Numeric ID from backend
  email: string;
  username: string;
  access_token: string;
  token_type: string;
}

// Type definitions are now in frontend/types/next-auth.d.ts

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'seuemail@exemplo.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, _req) { // Mark req as unused
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e password são obrigatórios.');
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        try {
          const res = await fetch(`${backendUrl}/api/v1/auth/login`, {
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
            // Try to parse error detail from backend
            let errorDetail = 'Falha na autenticação';
            try {
              const errorData = await res.json();
              if (errorData && errorData.detail) {
                errorDetail = errorData.detail;
              }
            } catch (_parseError) { // Mark as unused
              // Ignore if parsing fails, use default message
            }
            throw new Error(errorDetail);
          }

          const backendUser: BackendUser = await res.json();

          if (backendUser && backendUser.access_token) {
            // Return an object that matches the augmented NextAuth User type (from next-auth.d.ts)
            return {
              id: backendUser.id.toString(), // NextAuth User expects id as string
              email: backendUser.email,
              name: backendUser.username, // Use username as name for NextAuth User
              username: backendUser.username, // Custom property
              accessToken: backendUser.access_token, // Custom property
            } as User; // Cast to the augmented User type
          } else {
            return null; // Authentication failed
          }
        } catch (error) {
          console.error("Authorize error:", error);
          const errorMessage = error instanceof Error ? error.message : 'Erro de autenticação no servidor.';
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null; profile?: Profile }): Promise<JWT> {
      // On initial sign-in, `user` object is available (from `authorize` callback)
      if (account && user) {
        // user here is the object returned by authorize, matching our augmented User type
        token.accessToken = user.accessToken;
        token.userId = parseInt(user.id, 10); // Store our numeric id
        token.username = user.username;
        // Standard JWT claims that NextAuth might use or expect
        token.name = user.name;
        token.email = user.email;
        // token.picture = user.image; // if you have image
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      // The token object here is what the `jwt` callback returned
      // We add custom properties to the session object
      // The session type is augmented in next-auth.d.ts
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.userId && session.user) {
        session.user.id = token.userId; 
      }
      if (token.username && session.user) {
        session.user.username = token.username;
      }
      // Ensure session.user.name, email are populated from token if they exist
      if (token.name && session.user) {
        session.user.name = token.name;
      }
      if (token.email && session.user) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
