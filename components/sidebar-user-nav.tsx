'use client';
import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { usePrivy, useWallets } from '@privy-io/react-auth';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModelSelector } from './model-selector';
import { VisibilitySelector, VisibilityType } from './visibility-selector';

export function SidebarUserNav({ 
  selectedModelId,
  selectedVisibilityType,
  chatId,
  isReadonly,
}: { 
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  chatId: string;
  isReadonly: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const { authenticated, logout } = usePrivy();
  const { wallets } = useWallets();
  const primaryWallet = wallets?.[0];

  if (!authenticated || !primaryWallet) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className="focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
        <Button 
          variant="outline" 
          className="md:h-[34px] rounded-[10px] border border-[#2e2e2e] bg-[#131313] text-white  hover:text-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex items-center gap-2"
        >
          <Image
            src={`https://avatar.vercel.sh/${primaryWallet.address}`}
            alt={primaryWallet.address ?? 'Wallet Address'}
            width={16}
            height={16}
            className="rounded-full"
          />
          <span className="truncate max-w-[140px] max-[950px]:hidden">
            {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
          </span>
          <div className="ml-1">
            <ChevronDown size={16} />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[300px] rounded-[10px] border border-[#2e2e2e] bg-[#131313]  [&>*:hover]:text-white"
      > 
        {/* Wallet Info */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <Image
              src={`https://avatar.vercel.sh/${primaryWallet.address}`}
              alt={primaryWallet.address ?? 'Wallet Address'}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-white/80 text-sm">
              {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-[#2e2e2e]" />

        {/* Model and Visibility Selectors */}
        {!isReadonly && (
          <div className="p-2">
            <div className="mb-2">
              <ModelSelector
                selectedModelId={selectedModelId}
                className="w-full"
              />
            </div>
            <div>
              <VisibilitySelector
                chatId={chatId}
                selectedVisibilityType={selectedVisibilityType}
                className="w-full"
              />
            </div>
          </div>
        )}

        <DropdownMenuSeparator className="bg-[#2e2e2e]" />
        <DropdownMenuItem
          className="gap-4 group/item flex flex-row justify-center items-center text-white/80 hover:bg-[#252525] hover:text-white focus:bg-[#252525] focus:text-white"
          onSelect={logout}
        >
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
