'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { cn, fetcher } from '@/lib/utils';
import { usePrivy, useWallets } from '@privy-io/react-auth';

import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Chat } from '@/lib/db/schema';
import { useChatVisibility } from '@/hooks/use-chat-visibility';

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onSelect: (chatId: string) => void;
}

const PureChatItem = React.forwardRef<HTMLLIElement, ChatItemProps>(
  ({ chat, isActive, onDelete, onSelect }, ref) => {
    const { visibilityType, setVisibilityType } = useChatVisibility({
      chatId: chat.id,
      initialVisibility: chat.visibility,
    });
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(`/chat/${chat.id}`);
      onSelect(chat.id);
    };

    return (
      <li ref={ref} className="group/menu-item relative">
        <div className="flex items-center">
          <button
            onClick={handleClick}
            className={cn(
              'flex-1 truncate px-3 py-2 rounded-[19.125px] transition-colors text-left',
              isActive 
                ? 'bg-[rgba(33,13,62,0.60)] text-white border-[1.125px] border-[#3F1E3E]' 
                : 'hover:bg-[rgba(33,13,62,0.45)] text-white/80 hover:text-white'
            )}
          >
            <span>{chat.title}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="mr-0.5 p-1 hover:bg-[rgba(33,13,62,0.45)] text-white/80 hover:text-white rounded-md"
                aria-label="More options"
              >
                <MoreHorizontalIcon size={16} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="end" className="bg-[rgba(33,13,62,0.90)] border-[#3F1E3E]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer text-white/80 hover:text-white hover:bg-[rgba(33,13,62,0.60)]">
                  <ShareIcon size={16} />
                  <span>Share</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-[rgba(33,13,62,0.90)] border-[#3F1E3E]">
                    <DropdownMenuItem
                      className="cursor-pointer flex-row justify-between text-white/80 hover:text-white hover:bg-[rgba(33,13,62,0.60)]"
                      onClick={() => {
                        setVisibilityType('private');
                      }}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <LockIcon size={12} />
                        <span>Private</span>
                      </div>
                      {visibilityType === 'private' ? (
                        <CheckCircleFillIcon size={16} />
                      ) : null}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer flex-row justify-between text-white/80 hover:text-white hover:bg-[rgba(33,13,62,0.60)]"
                      onClick={() => {
                        setVisibilityType('public');
                      }}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <GlobeIcon size={16} />
                        <span>Public</span>
                      </div>
                      {visibilityType === 'public' ? (
                        <CheckCircleFillIcon size={16} />
                      ) : null}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-[rgba(33,13,62,0.60)]"
                onClick={() => onDelete(chat.id)}
              >
                <TrashIcon size={16} />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </li>
    );
  }
);

PureChatItem.displayName = 'PureChatItem';

const ChatItem = memo(PureChatItem);

interface PrivyUser {
  id: string;
  address: string;
}

interface SidebarHistoryProps {
  user: PrivyUser | undefined;
}

export const SidebarHistory = React.forwardRef<HTMLDivElement, SidebarHistoryProps & { onSelect?: () => void }>(
  ({ user, onSelect }, ref) => {
    const { id } = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const { wallets } = useWallets();
    const primaryWallet = wallets?.[0];
    const { getAccessToken } = usePrivy();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
      const fetchToken = async () => {
        if (user && primaryWallet) {
          const accessToken = await getAccessToken();
          setToken(accessToken);
        }
      };
      fetchToken();
    }, [user, primaryWallet, getAccessToken]);

    const {
      data: history,
      isLoading,
      error,
      mutate,
    } = useSWR<Array<Chat>>(
      token ? {
        url: '/api/history',
        headers: {
          authorization: `Bearer ${token}`
        }
      } : null, 
      fetcher,
      {
        fallbackData: [],
        onError: (err) => {
          console.error('Failed to fetch chat history:', err);
          toast.error('Failed to load chat history');
        }
      }
    );

    useEffect(() => {
      if (pathname.includes('/chat/')) {
        mutate();
      }
    }, [pathname, mutate]);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
      if (!token) {
        toast.error('Please connect your wallet');
        return;
      }

      const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      toast.promise(deletePromise, {
        loading: 'Deleting chat...',
        success: () => {
          mutate((history) => {
            if (history) {
              return history.filter((h) => h.id !== deleteId);
            }
            return history;
          }, false); // Don't revalidate immediately
          return 'Chat deleted successfully';
        },
        error: 'Failed to delete chat',
      });

      setShowDeleteDialog(false);

      if (deleteId === id) {
        router.push('/');
      }
    };

    const handleSelect = async (chatId: string) => {
      try {
        // Navigate to the chat
        await router.push(`/chat/${chatId}`);
        
        // Call onSelect callback if provided and on mobile
        if (onSelect && window.innerWidth <= 600) {
          onSelect();
        }
      } catch (error) {
        console.error('Failed to navigate to chat:', error);
        toast.error('Failed to load chat');
      }
    };

    if (!user) {
      return (
        <SidebarGroup>
          <div className="px-2 py-1 text-sm text-white/60">
            Connect your wallet to see chat history
          </div>
        </SidebarGroup>
      );
    }

    if (isLoading) {
      return (
        <SidebarGroup>
          <div className="px-2 py-1 text-sm text-white/60">
            Loading chat history...
          </div>
        </SidebarGroup>
      );
    }

    if (error) {
      return (
        <SidebarGroup>
          <div className="px-2 py-1 text-sm text-red-400">
            Failed to load chat history
          </div>
        </SidebarGroup>
      );
    }

    if (!history || history.length === 0) {
      return (
        <SidebarGroup>
          <div className="px-2 py-1 text-sm text-white/60">
            No chat history found
          </div>
        </SidebarGroup>
      );
    }

    const groupChatsByDate = (chats: Chat[]): GroupedChats => {
      const now = new Date();
      const oneWeekAgo = subWeeks(now, 1);
      const oneMonthAgo = subMonths(now, 1);

      return chats.reduce(
        (groups, chat) => {
          const chatDate = chat.createdAt ? new Date(chat.createdAt) : new Date();

          if (isToday(chatDate)) {
            groups.today.push(chat);
          } else if (isYesterday(chatDate)) {
            groups.yesterday.push(chat);
          } else if (chatDate > oneWeekAgo) {
            groups.lastWeek.push(chat);
          } else if (chatDate > oneMonthAgo) {
            groups.lastMonth.push(chat);
          } else {
            groups.older.push(chat);
          }

          return groups;
        },
        {
          today: [],
          yesterday: [],
          lastWeek: [],
          lastMonth: [],
          older: [],
        } as GroupedChats,
      );
    };

    const groupedChats = groupChatsByDate(history);

    return (
      <>
        <div ref={ref}>
          {groupedChats.today.length > 0 && (
            <SidebarGroup>
              <SidebarGroupContent>
                <span className="text-xs font-semibold text-white/60">Today</span>
                <SidebarMenu>
                  {groupedChats.today.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onSelect={handleSelect}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {groupedChats.yesterday.length > 0 && (
            <SidebarGroup>
              <SidebarGroupContent>
                <span className="text-xs font-semibold text-white/60">Yesterday</span>
                <SidebarMenu>
                  {groupedChats.yesterday.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onSelect={handleSelect}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {groupedChats.lastWeek.length > 0 && (
            <SidebarGroup>
              <SidebarGroupContent>
                <span className="text-xs font-semibold text-white/60">Last 7 days</span>
                <SidebarMenu>
                  {groupedChats.lastWeek.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onSelect={handleSelect}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {groupedChats.lastMonth.length > 0 && (
            <SidebarGroup>
              <SidebarGroupContent>
                <span className="text-xs font-semibold text-white/60">Last 30 days</span>
                <SidebarMenu>
                  {groupedChats.lastMonth.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onSelect={handleSelect}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {groupedChats.older.length > 0 && (
            <SidebarGroup>
              <SidebarGroupContent>
                <span className="text-xs font-semibold text-white/60">Older</span>
                <SidebarMenu>
                  {groupedChats.older.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                      onDelete={(chatId) => {
                        setDeleteId(chatId);
                        setShowDeleteDialog(true);
                      }}
                      onSelect={handleSelect}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this chat and all its messages.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

SidebarHistory.displayName = 'SidebarHistory';
