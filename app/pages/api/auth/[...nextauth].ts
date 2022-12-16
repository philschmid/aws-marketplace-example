import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import type { NextAuthOptions } from 'next-auth';
import {
  DynamoDB,
  DynamoDBClientConfig,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBAdapter } from '@next-auth/dynamodb-adapter';
import { config } from '../../../lib/dynamoDb';

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile(profile, tokens) {
        return {
          id: profile.id,
          login: profile.login,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    // ...add more providers here
  ],
  session: {
    strategy: 'jwt',
  },
  adapter: DynamoDBAdapter(client, {
    tableName: process.env.NEXT_AUTH_DYNAMODB_TABLE,
  }),
  callbacks: {
    // used to check if a user is allowed to sign in
    // async signIn(props) {
    // },
    async jwt({ token, account, profile, isNewUser }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      // @ts-ignore
      if (profile && profile.id) {
        // @ts-ignore
        token.id = profile.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.user.id = token.id;
      return session;
    },
  },
  // secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signIn',
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

export default NextAuth(authOptions);
