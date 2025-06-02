import 'next-auth';
import 'next-auth/jwt';

// Augment the NextAuth types
declare module 'next-auth' {
  /**
   * The `User` object returned by the `authorize` callback and received by the `jwt` callback.
   * It can have custom properties.
   */
  interface User {
    // NextAuth's default User has id (string), name?, email?, image?
    // We are adding these custom properties from our backend
    // Making them non-optional as authorize callback should always return them
    username: string;
    accessToken: string;
    // id is expected to be a string by NextAuth User model,
    // ensure authorize callback returns it as string.
    // id: string; // This is inherited from NextAuthUser
  }

  /**
   * The `Session` object available via `useSession()` or `getSession()`.
   * It can have custom properties.
   */
  interface Session {
    accessToken: string; // Make non-optional if it's always present for authenticated sessions
    user: {
      id: number; // This is our primary, numeric id for the session user
      username?: string;
      // Include other properties from the base NextAuth User, but OMIT its 'id'
      // to avoid conflict with our numeric 'id'.
      // Also include custom properties from our augmented 'User' interface.
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // accessToken from our augmented User might not be needed here as it's on Session directly
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * The `JWT` token object. It can have custom properties.
   */
  interface JWT {
    accessToken?: string;
    userId?: number; // Our numeric id, converted from User.id (string)
    username?: string;
    // Standard claims that NextAuth might use from user object if present
    // These are typically: name, email, picture
  }
}
