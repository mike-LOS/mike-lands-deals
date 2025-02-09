import { NextRequest, NextResponse } from 'next/server';
import { getJwks, verifyJwt } from './auth/privy';

export async function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function (req: NextRequest) {
    try {
      // For non-API routes, allow access
      if (!req.url.includes('/api/')) {
        return handler(req);
      }

      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // For wallet authentication, we just verify the wallet address is present
      const walletAddress = authHeader.split(' ')[1];
      if (!walletAddress) {
        return new NextResponse('Unauthorized - No wallet address', { status: 401 });
      }

      // Add the wallet address to the request for use in the handler
      const headers = new Headers(req.headers);
      headers.set('X-Wallet-Address', walletAddress);

      // Create a new request with the modified headers
      const modifiedReq = new NextRequest(req.url, {
        method: req.method,
        headers,
        body: req.body,
        cache: req.cache,
        credentials: req.credentials,
        integrity: req.integrity,
        keepalive: req.keepalive,
        mode: req.mode,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        signal: req.signal,
      });

      const jwks = await getJwks();
      const payload = await verifyJwt(modifiedReq.headers.get('Authorization')?.split(' ')[1] || '', jwks);

      if (!payload) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // Add user info to request
      (modifiedReq as any).user = {
        id: payload.sub,
        walletAddress: payload.wallet_address
      };

      return handler(modifiedReq);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }
} 