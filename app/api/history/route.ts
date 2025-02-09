import { getChatsByUserId, getUser } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { getJwks, verifyJwt } from '@/lib/auth/privy';

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ History API: No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwks = await getJwks();
    const verified = await verifyJwt(token, jwks);
    
    if (!verified) {
      console.log('❌ History API: Invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verified.sub;
    console.log('🔍 History API: Getting chats for user:', userId);

    // Get user by Privy DID
    const [user] = await getUser(userId);
    if (!user) {
      console.log('❌ History API: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ History API: Found user:', user.id);

    // Get all chats for the user
    const chats = await getChatsByUserId({ id: user.id });
    console.log(`✅ History API: Found ${chats.length} chats for user:`, user.id);

    return NextResponse.json(chats);
  } catch (error) {
    console.error('❌ History API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
