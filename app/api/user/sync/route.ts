import { NextResponse } from 'next/server';
import { createOrUpdateUser } from '@/lib/db/queries/users';
import { getJwks, verifyJwt } from '@/lib/auth/privy';

export async function POST(request: Request) {
  console.log('🔄 POST /api/user/sync - Starting request');
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('🔑 Authorization header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Get wallet address from header
    const walletAddress = authHeader.split(' ')[1];
    console.log('👛 Extracted wallet address:', walletAddress);
    
    if (!walletAddress) {
      console.error('❌ No wallet address found in token');
      return NextResponse.json(
        { error: 'No wallet address found in token' },
        { status: 401 }
      );
    }

    // Get user data from request body
    const userData = await request.json();
    console.log('📥 Received user data:', {
      id: userData.id,
      email: userData.email,
      walletAddress: walletAddress,
      walletPublicKey: userData.walletPublicKey
    });

    if (!userData.id) {
      console.error('❌ Missing required user ID');
      return NextResponse.json(
        { error: 'Missing required user ID' },
        { status: 400 }
      );
    }

    // Ensure we have the required fields
    const userToSync = {
      id: userData.id,
      email: userData.email || null,
      walletAddress: walletAddress,
      walletPublicKey: userData.walletPublicKey || walletAddress,
      name: userData.name || null,
      image: userData.image || null,
      emailVerified: userData.emailVerified ? new Date(userData.emailVerified) : null
    };

    console.log('🔄 Attempting database sync with user:', userToSync);

    try {
      const user = await createOrUpdateUser(userToSync);
      console.log('✅ User synced successfully:', user);
      return NextResponse.json({ user });
    } catch (dbError) {
      console.error('❌ Database error during sync:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error during sync',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Unexpected error in sync route:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to sync user with database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 