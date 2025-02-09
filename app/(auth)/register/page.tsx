'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = usePrivy();

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Create Account</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Connect your wallet to get started
          </p>
        </div>
        <div className="flex justify-center p-4">
          <button
            onClick={login}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
