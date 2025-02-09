'use client';

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { cn, sanitizeUIMessages } from '@/lib/utils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { IoAttach } from 'react-icons/io5';
import { BsArrowUpSquareFill } from 'react-icons/bs';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';

interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
  selectedModelId?: string;
  requiresAuth?: boolean;
}

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedModelId = 'gpt-4',
  requiresAuth = true,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const primaryWallet = wallets?.[0];
  const [token, setToken] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '48px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, [localStorageInput, setInput, adjustHeight]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  useEffect(() => {
    const fetchToken = async () => {
      if (authenticated) {
        const accessToken = await getAccessToken();
        setToken(accessToken);
      }
    };
    fetchToken();
  }, [authenticated, getAccessToken]);

  const handleMessageSubmit = useCallback(async () => {
    if (!authenticated || !ready) {
      console.log('🔒 Authentication required for sending messages');
      login();
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        console.error('❌ No access token available');
        return;
      }

      console.log('✉️ Submitting message', {
        ready,
        authenticated,
        userId: primaryWallet?.address,
        modelId: selectedModelId,
        timestamp: new Date().toISOString(),
        token: token.substring(0, 10) + '...'
      });
      
      window.history.replaceState({}, '', `/chat/${chatId}`);

      // Create the message object
      const message = {
        role: 'user' as const,
        content: input,
      };

      // Create the chat request
      const chatRequest = {
        messages: [message],
        modelId: selectedModelId,
        id: chatId
      };

      console.log('📦 Chat request:', {
        messageCount: chatRequest.messages.length,
        modelId: chatRequest.modelId,
        chatId: chatRequest.id
      });

      // Append the message with authorization header
      append(chatRequest.messages[0], {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        experimental_attachments: attachments,
      });

      setAttachments([]);
      setLocalStorageInput('');
      resetHeight();

      if (width && width > 768) {
        textareaRef.current?.focus();
      }
    } catch (error) {
      console.error('❌ Error submitting message:', error);
    }
  }, [
    authenticated,
    ready,
    login,
    getAccessToken,
    primaryWallet,
    attachments,
    append,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    selectedModelId,
    input,
  ]);

  const onDrop = useCallback(
    async (acceptedFiles: Array<File>) => {
      if (!authenticated) {
        toast.error('Please connect your wallet to upload files');
        return;
      }

      const formData = new FormData();
      formData.append('chatId', chatId);
      formData.append('file', acceptedFiles[0]);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const { url } = await response.json();

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          {
            url,
            name: acceptedFiles[0].name,
            type: acceptedFiles[0].type,
          },
        ]);
      } catch (error) {
        console.error('Failed to upload file:', error);
        toast.error('Failed to upload file');
      }
    },
    [authenticated, chatId, setAttachments],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!authenticated) {
        toast.error('To talk to Mike, please connect your wallet first');
        return;
      }
      handleMessageSubmit();
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      toast.error('To talk to Mike, please connect your wallet first');
      return;
    }
    handleMessageSubmit();
  };

  return (
    <form
      ref={formRef}
      onSubmit={onFormSubmit}
      {...getRootProps()}
      className="relative flex items-center h-full"
    >
      <input {...getInputProps()} />
      <button
        type="button"
        className="flex items-center justify-center w-12 h-full text-white/60 hover:text-white"
      >
        <IoAttach size={24} className="rotate-135" />
      </button>
      <textarea
        ref={textareaRef}
        tabIndex={0}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={authenticated ? "Send a message..." : "Connect wallet to chat with Mike..."}
        spellCheck={false}
        className="flex-1 resize-none bg-transparent text-white text-base font-normal font-['Roboto'] leading-normal outline-none"
      />
      <button
        type="submit"
        className={cn(
          "flex items-center justify-center w-12 h-full transition-colors",
          input.trim() ? "text-white" : "text-white/60 hover:text-white"
        )}
      >
        <BsArrowUpSquareFill size={26} />
      </button>
    </form>
  );
}

function PureAttachmentsButton({
  fileInputRef,
  isLoading,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLoading: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cx('h-8 w-8 p-0', {
        'opacity-50': isLoading,
      })}
      disabled={isLoading}
      onClick={() => fileInputRef.current?.click()}
    >
      <PaperclipIcon />
      <span className="sr-only">Attach files</span>
    </Button>
  );
}

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="size-8 p-0"
      onClick={() => {
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon />
      <span className="sr-only">Stop generating</span>
    </Button>
  );
}

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
  isAuthenticated,
  login,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
  isAuthenticated: boolean;
  login: () => void;
}) {
  const handleClick = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    submitForm();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className={cx('h-8 w-8 p-0 text-white hover:text-white/80', {
        'opacity-50': !isAuthenticated && !input.trim() && uploadQueue.length === 0,
      })}
      onClick={handleClick}
    >
      {isAuthenticated ? <ArrowUpIcon /> : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )}
      <span className="sr-only">
        {isAuthenticated ? 'Send message' : 'Connect wallet'}
      </span>
    </Button>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.input === nextProps.input &&
    prevProps.isLoading === nextProps.isLoading &&
    equal(prevProps.attachments, nextProps.attachments) &&
    equal(prevProps.messages, nextProps.messages)
  );
});
