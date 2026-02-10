/**
 * NextAuth.js API Route Handler
 * 
 * Handles authentication requests.
 * Only active in hosted mode.
 */

import { config } from '@/app/lib/config';
import { NextResponse } from 'next/server';

// Return 404 if not in hosted mode
if (!config.requiresAuth()) {
  export function GET() {
    return NextResponse.json(
      { error: 'Authentication not available in self-hosted mode' },
      { status: 404 }
    );
  }
  export const POST = GET;
} else {
  // Only import auth in hosted mode
  const { handlers } = require('@/app/lib/auth');
  export const { GET, POST } = handlers;
}
