import 'server-only';

import { and, asc, desc, eq, gt, gte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../env';
import {
  users,
  chats,
  type User,
  type Chat,
  documents,
  type Document,
  suggestions,
  type Message,
  messages,
} from './schema';
import { BlockKind } from '@/components/block';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const client = postgres(process.env.POSTGRES_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, {
  logger: process.env.NODE_ENV === 'development',
});

export async function getUser(id: string): Promise<User[]> {
  try {
    console.log('DB: Getting user with ID:', id);
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    console.log('DB: Found users:', result);
    return result;
  } catch (error) {
    console.error('Failed to get user from database', error);
    throw error;
  }
}

export async function createUser(id: string, email: string | null = null): Promise<void> {
  try {
    console.log('DB: Creating user:', { id, email });
    await db.insert(users).values({
      id,
      email: email || `${id}@askmike.xyz`,
      walletAddress: id,
      walletPublicKey: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('DB: User created successfully');
  } catch (error) {
    console.error('Failed to create user in database', error);
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    console.log('DB: Saving chat:', { id, userId, title });
    const result = await db.insert(chats).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
    console.log('DB: Chat saved:', result);
    return result;
  } catch (error) {
    console.error('Failed to save chat in database', error);
    throw error;
  }
}

export async function deleteChat({ id }: { id: string }) {
  try {
    await db.delete(messages).where(eq(messages.chatId, id));
    await db.delete(chats).where(eq(chats.id, id));
  } catch (error) {
    console.error('Failed to delete chat from database', error);
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chats)
      .where(eq(chats.userId, id))
      .orderBy(desc(chats.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    console.log('DB: Getting chat by ID:', id);
    const [selectedChat] = await db.select().from(chats).where(eq(chats.id, id));
    console.log('DB: Found chat:', selectedChat);
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database', error);
    throw error;
  }
}

export async function saveMessages({ messages: messagesToSave }: { messages: Message[] }) {
  try {
    return await db.insert(messages).values(messagesToSave);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, id))
      .orderBy(asc(messages.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(documents).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const results = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .orderBy(asc(documents.createdAt));

    return results;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .orderBy(desc(documents.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestions)
      .where(
        and(
          eq(suggestions.documentId, id),
          gt(suggestions.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(documents)
      .where(and(eq(documents.id, id), gt(documents.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export type SuggestionInput = {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description?: string;
  userId: string;
};

export async function saveSuggestions({
  suggestions: suggestionsToSave,
}: {
  suggestions: SuggestionInput[];
}) {
  try {
    return await db.insert(suggestions).values(suggestionsToSave);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestions)
      .where(and(eq(suggestions.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(messages).where(eq(messages.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await db
      .delete(messages)
      .where(
        and(eq(messages.chatId, chatId), gte(messages.createdAt, timestamp)),
      );
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chats).set({ visibility }).where(eq(chats.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}
