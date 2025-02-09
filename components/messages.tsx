import * as React from 'react';
import { ChatRequestOptions, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { Overview } from './overview';
import { memo, useRef, useState, useEffect } from 'react';
import equal from 'fast-deep-equal';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isBlockVisible: boolean;
  showWelcomeMessage: boolean;
}

function PureMessages({
  chatId,
  messages,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  isBlockVisible,
  showWelcomeMessage
}: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldDelayScroll, setShouldDelayScroll] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isAtBottom) return;

    // For welcome message, add a delay before scrolling
    if (showWelcomeMessage && messages.length === 1 && messages[0].id === 'welcome-1') {
      setShouldDelayScroll(true);
      // Calculate total animation time: base delay (0.3s) + (number of lines × line delay)
      const lines = messages[0].content.split('\n').filter(line => line.trim()).length;
      const totalDelay = 300 + (lines * 120); // 300ms base + 120ms per line

      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        setShouldDelayScroll(false);
      }, totalDelay);

      return () => clearTimeout(timer);
    }

    // For regular messages, scroll immediately
    if (!shouldDelayScroll) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages, isAtBottom, showWelcomeMessage, shouldDelayScroll]);

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const buffer = 100; // pixels from bottom
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < buffer);
  };

  return (
    <div 
      className="flex-1 h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#3F1E3E] scrollbar-track-transparent overscroll-none"
      onScroll={handleScroll}
    >
      <div className="flex flex-col min-h-full">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {message.role === 'assistant' && showWelcomeMessage ? (
                <div className="flex flex-col space-y-2">
                  {message.content.split('\n').map((line, lineIndex) => (
                    line.trim() && (
                      <motion.div
                        key={lineIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: lineIndex * 0.12,
                          ease: "easeOut"
                        }}
                        className={cn(
                          "text-white font-['Roboto']",
                          line.startsWith('•') ? "pl-4" : "",
                          lineIndex === 0 ? "text-lg font-medium" : "text-base"
                        )}
                      >
                        {line}
                      </motion.div>
                    )
                  ))}
                </div>
              ) : (
                <PreviewMessage 
                  chatId={chatId}
                  message={message}
                  isLoading={isLoading && index === messages.length - 1}
                  setMessages={setMessages}
                  reload={reload}
                  isReadonly={isReadonly}
                />
              )}
            </motion.div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <ThinkingMessage />
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isBlockVisible && nextProps.isBlockVisible) return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});

