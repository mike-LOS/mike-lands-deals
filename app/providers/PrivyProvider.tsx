'use client';

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;
if (!PRIVY_APP_ID) {
  throw new Error('NEXT_PUBLIC_PRIVY_APP_ID environment variable is not set');
}

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <BasePrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#F5A524',
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}

// Export useful hooks from Privy for use in components
export {
  usePrivy,
  useWallets,
} from '@privy-io/react-auth';