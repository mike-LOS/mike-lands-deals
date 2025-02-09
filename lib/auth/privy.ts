import { jwtVerify, createRemoteJWKSet } from 'jose';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

if (!PRIVY_APP_ID) {
  throw new Error('NEXT_PUBLIC_PRIVY_APP_ID environment variable is not set');
}

// Interface for the verified JWT payload
interface PrivyJWTPayload {
  sub: string;  // Privy user ID
  wallet_address?: string;
  email?: string;
  iat: number;
  exp: number;
  aud?: string;
  iss?: string;
}

// Get JWKS (JSON Web Key Set) from Privy
export async function getJwks() {
  try {
    // Use the official JWKS endpoint with .json extension
    const jwksUrl = `https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`;
    console.log('🔑 Getting JWKS from:', jwksUrl);
    
    // First try to fetch the JWKS directly to check the response
    const response = await fetch(jwksUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ JWKS fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url: jwksUrl,
        appId: PRIVY_APP_ID
      });
      throw new Error(`JWKS fetch failed with status ${response.status}: ${response.statusText}`);
    }
    
    // If the fetch was successful, create the JWKS
    return createRemoteJWKSet(new URL(jwksUrl));
  } catch (error) {
    console.error('❌ Failed to get JWKS:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      appId: PRIVY_APP_ID,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Verify JWT token
export async function verifyJwt(token: string, jwks: ReturnType<typeof createRemoteJWKSet>) {
  try {
    console.log('🔐 Verifying JWT token...');
    const { payload } = await jwtVerify(token, jwks, {
      issuer: ['privy.io', 'auth.privy.io'],
      maxTokenAge: '1h',
      audience: PRIVY_APP_ID // Add audience check
    });
    
    // Ensure required fields are present
    if (!payload.iat || !payload.exp || !payload.sub) {
      throw new Error('Missing required JWT payload fields');
    }

    console.log('✅ JWT verification successful:', { 
      sub: payload.sub,
      iat: new Date(payload.iat * 1000).toISOString(),
      exp: new Date(payload.exp * 1000).toISOString(),
      issuer: payload.iss || 'not provided',
      audience: payload.aud || 'not provided'
    });
    
    return payload as PrivyJWTPayload;
  } catch (error) {
    console.error('❌ Error verifying JWT:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      token: token.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });
    return null;
  }
} 