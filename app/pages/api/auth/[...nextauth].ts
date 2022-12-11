import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile(profile,tokens) {
        return {
          id: profile.id,
          login: profile.login,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        }
    }}),
    // ...add more providers here
  ],
  callbacks: {
    // used to check if a user is allowed to sign in
    // async signIn(props) {
    // },
    async jwt({ token, account, profile, isNewUser }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && account.access_token) {
        token.accessToken = account.access_token
      }
      // @ts-ignore
      if (profile && profile.id) {
        // @ts-ignore
        token.id = profile.id
      }

      return token
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken
      // @ts-ignore
      session.user.id = token.id
      return session
    }
  },
  pages: {
    signIn: '/auth/signIn',
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/' // New users will be directed here on first sign in (leave the property out if not of interest)
  }
}

export default NextAuth(authOptions)