import { db } from '../index';
import { eq, desc, and } from 'drizzle-orm';
import { chats, messages, type Chat, type Message } from '../schema';

export async function getChatsByUserId(userId: string): Promise<Chat[]> {
  try {
    console.log('🔍 Getting chats for user:', userId);
    
    const result = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt));
    
    return result;
  } catch (error) {
    console.error('❌ Error getting chats:', error);
    throw error;
  }
}

export async function getChatById({ id, userId }: { id: string; userId?: string }): Promise<Chat | null> {
  try {
    console.log('🔍 Getting chat:', id);
    
    const query = userId 
      ? and(eq(chats.id, id), eq(chats.userId, userId))
      : eq(chats.id, id);
    
    const result = await db
      .select()
      .from(chats)
      .where(query)
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('❌ Error getting chat:', error);
    throw error;
  }
}

export async function createChat({ 
  id, 
  userId, 
  title, 
  visibility = 'private' 
}: { 
  id: string; 
  userId: string; 
  title: string; 
  visibility?: 'public' | 'private';
}): Promise<Chat> {
  try {
    console.log('📝 Creating new chat:', { id, userId, title });
    
    const [chat] = await db
      .insert(chats)
      .values({
        id,
        userId,
        title,
        visibility,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    console.log('✅ Chat created successfully:', chat);
    return chat;
  } catch (error) {
    console.error('❌ Error creating chat:', error);
    throw error;
  }
}

export async function updateChat({ 
  id, 
  userId, 
  title, 
  visibility 
}: { 
  id: string; 
  userId: string; 
  title?: string; 
  visibility?: 'public' | 'private';
}): Promise<Chat | null> {
  try {
    console.log('🔄 Updating chat:', { id, title, visibility });
    
    const [updated] = await db
      .update(chats)
      .set({
        title,
        visibility,
        updatedAt: new Date()
      })
      .where(and(eq(chats.id, id), eq(chats.userId, userId)))
      .returning();
    
    console.log('✅ Chat updated successfully:', updated);
    return updated;
  } catch (error) {
    console.error('❌ Error updating chat:', error);
    throw error;
  }
}

export async function deleteChat({ id, userId }: { id: string; userId: string }): Promise<void> {
  try {
    console.log('🗑️ Deleting chat:', id);
    
    await db
      .delete(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, userId)));
    
    console.log('✅ Chat deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting chat:', error);
    throw error;
  }
}

export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  try {
    console.log('🔍 Getting messages for chat:', chatId);
    
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt));
    
    return result;
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    throw error;
  }
}

export async function createMessage({ 
  id, 
  chatId, 
  role, 
  content 
}: { 
  id: string; 
  chatId: string; 
  role: string; 
  content: any;
}): Promise<Message> {
  try {
    console.log('📝 Creating new message:', { id, chatId, role });
    
    const [message] = await db
      .insert(messages)
      .values({
        id,
        chatId,
        role,
        content,
        createdAt: new Date()
      })
      .returning();
    
    console.log('✅ Message created successfully');
    return message;
  } catch (error) {
    console.error('❌ Error creating message:', error);
    throw error;
  }
} 