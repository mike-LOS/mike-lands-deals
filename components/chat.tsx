'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState, useEffect, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallets } from '@privy-io/react-auth';
import { Button } from './ui/button';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { useAuth } from '../app/contexts/AuthContext';
import { fetcher } from '@/lib/utils';
import * as React from 'react';
import { Block } from './block';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';
import { AppSidebar } from './app-sidebar';
import { BiExpandAlt } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatProps {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: 'public' | 'private';
  isReadonly: boolean;
}

export function Chat({ 
  id, 
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly 
}: ChatProps) {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { toggleSidebar, open } = useSidebar();
  const { isAuthenticated, user, loading } = useAuth();
  const { wallets } = useWallets();
  const primaryWallet = wallets?.[0];
  const [token, setToken] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.token) {
      setToken(user.token);
    }
  }, [isAuthenticated, user]);

  const chatConfig = useMemo(() => ({
    id,
    body: { 
      id,
      modelId: selectedModelId 
    },
    api: '/api/chat',
    initialMessages,
    experimental_throttle: 100,
    headers: token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : undefined,
    onFinish: () => {
      mutate('/api/history');
    },
  }), [id, token, mutate, selectedModelId, initialMessages]);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat(chatConfig);

  useEffect(() => {
    if (initialMessages?.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  // Memoize the buttons section
  const buttonsSection = useMemo(() => (
    <div className="flex gap-4 w-full">
      <Button
        variant="secondary"
        onClick={toggleSidebar}
        className="grow h-12 bg-[#cacaca] hover:bg-[#bebebe] text-black rounded-[10px] border-none uppercase font-['Roboto'] font-semibold"
      >
        CHAT HISTORY
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          router.push('/');
          router.refresh();
        }}
        className="grow h-12 bg-[#cacaca] hover:bg-[#bebebe] text-black rounded-[10px] border-none uppercase font-['Roboto'] font-semibold"
      >
        + NEW CHAT
      </Button>
    </div>
  ), [toggleSidebar, router]);

  // Update the animation trigger effect
  useEffect(() => {
    // Only animate for non-authenticated users
    if (isAuthenticated) {
      setIsLoaded(true);
      setHasAnimated(true);
      return;
    }

    // Start with everything in initial state
    setIsLoaded(false);
    setIsInitialLoad(true);
    setHasAnimated(false);
    
    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsLoaded(true);
        setIsInitialLoad(false);
      }, 200);
      
      // Add glow effect after a short delay
      setTimeout(() => {
        setHasAnimated(true);
      }, 800);
    });

    return () => {
      setIsLoaded(false);
      setIsInitialLoad(true);
      setHasAnimated(false);
    };
  }, [isAuthenticated]); // Add isAuthenticated as dependency

  // Add welcome message after chat opens with a delay
  useEffect(() => {
    // Only show welcome message if:
    // 1. Chat is open
    // 2. User is not authenticated (no Privy ID)
    // 3. No messages exist
    if (isChatOpen && !isAuthenticated && messages.length === 0) {
      const welcomeLines = [
        "👋 Welcome to Mike, your AI Legal Agent!",
        "I'm here to assist with:",
        "",
        "• Legal document analysis and drafting",
        "• Contract review and suggestions",
        "• Regulatory compliance guidance",
        "• Legal research assistance",
        "",
        "To get started, simply connect your wallet and ask me anything about your legal needs."
      ];

      const timer = setTimeout(() => {
        setMessages([
          {
            id: 'welcome-1',
            role: 'assistant',
            content: welcomeLines.join('\n'),
            createdAt: new Date()
          }
        ]);
        setShowWelcomeMessage(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isChatOpen, isAuthenticated, setMessages, messages.length]);

  // Handle chat window state persistence
  useEffect(() => {
    // Check if the window should be open based on URL or other state
    const shouldBeOpen = window.location.hash === '#chat';
    setIsChatOpen(shouldBeOpen);

    // Update URL when chat window state changes
    const handleHashChange = () => {
      setIsChatOpen(window.location.hash === '#chat');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL when chat window opens/closes
  useEffect(() => {
    if (isChatOpen) {
      window.location.hash = 'chat';
    } else {
      // Remove the hash without causing a page jump
      const newUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', newUrl);
    }
  }, [isChatOpen]);

  // Clear welcome message when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcomeMessage(false);
      if (messages.length === 1 && messages[0].id === 'welcome-1') {
        setMessages([]);
      }
    }
  }, [isAuthenticated, messages, setMessages]);

  return (
    <AnimatePresence>
      {isChatOpen ? (
        <motion.div 
          initial={{ 
            scale: 0.8, 
            opacity: 0, 
            y: 20,
            transformOrigin: 'bottom right'
          }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.5,
              opacity: { duration: 0.2 }
            }
          }}
          exit={{ 
            scale: 0.8, 
            opacity: 0,
            y: 20,
            transition: {
              type: "tween",
              duration: 0.2,
              ease: "easeOut"
            }
          }}
          className="w-[389px] h-[455px] bg-[#131313] rounded-[18px] border border-[#2e2e2e] flex flex-col fixed bottom-8 right-8 overflow-hidden z-50"
        >
          {/* Header - Add fade-in animation for children */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.1, duration: 0.2 }
            }}
            className="flex items-center justify-between p-6"
          >
            <div className="flex items-center gap-3">
              <div className="size-[42px] bg-[#d9d9d9] rounded-full" />
              <span className="text-white text-2xl font-['Roboto']">Mike AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-white hover:text-white/80">
                <BiExpandAlt size={24} />
              </button>
              <button 
                className="text-white hover:text-white/80"
                onClick={() => setIsChatOpen(false)}
              >
                <IoClose size={24} />
              </button>
            </div>
          </motion.div>

          {/* Messages Container - Add fade-in animation */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.2, duration: 0.3 }
            }}
            className="flex-1 mx-6 bg-[#1b1b1b] rounded-xl border border-[#2e2e2e] overflow-hidden"
          >
            <Messages
              chatId={id}
              messages={messages}
              isLoading={isLoading}
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
              isBlockVisible={false}
              showWelcomeMessage={showWelcomeMessage}
            />
          </motion.div>

          {/* Input Container - Add fade-in animation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.3, duration: 0.2 }
            }}
            className="mx-6 my-4"
          >
            <div className="h-12 bg-[#252525] rounded-[10px] border border-[#2e2e2e] overflow-hidden">
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                append={append}
              />
            </div>
          </motion.div>

          {/* Bottom Buttons - Add fade-in animation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.4, duration: 0.2 }
            }}
            className="px-6 pb-6"
          >
            {buttonsSection}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: isAuthenticated ? 1 : 0 }}
          animate={{ 
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.button
            onClick={() => setIsChatOpen(true)}
            className="size-[60px] bg-[#131313] rounded-full border border-[#2e2e2e] flex items-center justify-center hover:bg-[#1b1b1b] transition-colors"
            whileHover={{ scale: 1.05 }}
            animate={hasAnimated ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0 0px rgba(255, 255, 255, 0)",
                "0 0 0 8px rgba(255, 255, 255, 0.1)",
                "0 0 0 0px rgba(255, 255, 255, 0)"
              ],
              transition: {
                scale: {
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 1,
                  times: [0, 0.5, 1],
                  ease: "easeInOut"
                },
                boxShadow: {
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 1,
                  times: [0, 0.5, 1],
                  ease: "easeInOut"
                }
              }
            } : {}}
          >
            <div className="size-[42px] bg-[#d9d9d9] rounded-full" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
