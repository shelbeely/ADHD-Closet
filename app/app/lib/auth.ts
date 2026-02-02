/**
 * NextAuth.js Configuration
 * 
 * Authentication configuration for multi-user hosted mode.
 * This file is only active when DEPLOYMENT_MODE=hosted.
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/app/lib/prisma';
import { config } from '@/app/lib/config';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Only use auth in hosted mode
if (!config.requiresAuth()) {
  throw new Error('NextAuth should not be imported in self-hosted mode');
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      // You can implement email/password auth here
      // For now, we'll use OAuth providers only
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: Implement email/password authentication
        // For now, return null to disable
        return null;
      },
    }),
    // Add OAuth providers here when configured
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/auth/welcome',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        
        // Add subscription tier to session
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscriptionTier: true,
            analyticsOptIn: true,
            dataSharing: true,
            adConsent: true,
          },
        });
        
        if (dbUser) {
          session.user.subscriptionTier = dbUser.subscriptionTier;
          session.user.analyticsOptIn = dbUser.analyticsOptIn;
          session.user.dataSharing = dbUser.dataSharing;
          session.user.adConsent = dbUser.adConsent;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Update last login time
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
      
      return true;
    },
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
