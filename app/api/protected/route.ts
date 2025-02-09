import { withAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

async function handler(request: NextRequest): Promise<NextResponse> {
  // The user is available on the request object
  const user = (request as any).user;

  return NextResponse.json({
    message: 'Protected route',
    user
  });
}

// Create an async GET handler that awaits the withAuth wrapper
export async function GET(request: NextRequest): Promise<NextResponse> {
  const protectedHandler = await withAuth(handler);
  return protectedHandler(request);
} 