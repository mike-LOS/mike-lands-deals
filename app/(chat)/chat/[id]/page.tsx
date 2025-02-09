'use client';

import { notFound } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { useEffect, useState, use } from 'react';
import type { Chat as ChatType } from '@/lib/db/schema';
import { toast } from 'sonner';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { authenticated, ready, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const primaryWallet = wallets?.[0];
  const [chat, setChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Only attempt to load data if authenticated
      if (!ready || !authenticated) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('🔄 Loading existing chat data:', { id });
        const token = await getAccessToken();
        
        console.log('🎫 Got access token:', token?.substring(0, 10) + '...');
        
        const response = await fetch(`/api/chat?id=${id}`, {
          headers: {
            authorization: `Bearer ${token}`
          }
        });

        console.log('📡 Chat API response:', {
          status: response.status,
          ok: response.ok
        });

        if (response.status === 404) {
          // This is a new chat
          setIsNewChat(true);
          setChat(null);
          setMessages([]);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load chat');
        }

        const data = await response.json();
        console.log('✅ Chat data loaded:', {
          hasChat: !!data.chat,
          messageCount: data.messages?.length
        });
        
        setChat(data.chat);
        setMessages(data.messages);
        setIsNewChat(false);
      } catch (error) {
        console.error('❌ Failed to load chat:', error);
        toast.error('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    }

    // Reset states when id changes
    setChat(null);
    setMessages([]);
    setIsNewChat(false);
    
    loadData();
  }, [id, ready, authenticated, getAccessToken]);

  // Only show loading state while Privy is initializing
  if (!ready) {
    return <div>Loading...</div>;
  }

  // Show chat interface (empty for new chats or unauthenticated users)
  return (
    <>
      <Chat
        id={id}
        initialMessages={convertToUIMessages(messages)}
        selectedModelId={DEFAULT_MODEL_NAME}
        selectedVisibilityType={chat?.visibility || 'private'}
        isReadonly={!authenticated || isLoading}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
