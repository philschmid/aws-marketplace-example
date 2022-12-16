import 'next-auth/jwt';
import NextAuth from 'next-auth';

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's role. */
    name: string;
    email: string;
    picture: string;
    sub: string;
    accessToken: string;
    iat: number;
    exp: number;
    jti: string;
  }
}
interface User {
  name: string;
  email: string;
  id: string;
  image?: string;
  login?: string;
}

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    sub: string;
    user: User;
  }
}
