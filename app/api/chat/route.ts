import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
  type DataStreamWriter
} from 'ai';
import { z } from 'zod';
import { getJwks, verifyJwt } from '@/lib/auth/privy';
import { OpenAI } from 'openai';
import { generateUUID } from '@/lib/utils';

import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { getSystemPrompt, mike } from '@/lib/ai/prompts';
import {
  deleteChat,
  getChatById,
  getMessagesByChatId,
  getUser,
  createUser,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request) => {
  try {
    const json = await req.json();
    const { messages, modelId, id } = json;
    console.log('📨 Chat API: Received request:', {
      id,
      modelId,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]
    });

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Chat API: No authorization header or invalid format:', { authHeader });
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwks = await getJwks();
    const verified = await verifyJwt(token, jwks);
    
    if (!verified) {
      console.log('❌ Chat API: Invalid token');
      return new Response('Unauthorized', { status: 401 });
    }

    // Get or create user using Privy DID
    const userId = verified.sub;
    console.log('🔍 Chat API: Looking up user:', userId);
    let user = (await getUser(userId))[0];
    
    if (!user) {
      try {
        console.log('📝 Chat API: Creating new user:', userId);
        await createUser(userId);
        user = (await getUser(userId))[0];
        if (!user) {
          console.error('❌ Chat API: Failed to create and retrieve user');
          return new Response('Failed to create user', { status: 500 });
        }
        console.log('✅ Chat API: User created successfully:', user);
      } catch (error: any) {
        console.error('❌ Chat API: Error creating user:', error);
        return new Response('Failed to create user', { status: 500 });
      }
    }

    const model = models.find((m) => m.id === modelId) ?? models[0];
    const coreMessages = convertToCoreMessages(messages);
    const lastUserMessage = coreMessages[coreMessages.length - 1];
    const userMessageId = generateUUID();
    const chat = await getChatById({ id });

    if (!chat) {
      console.log('📝 Chat API: Creating new chat');
      await saveChat({
        id,
        userId: user.id,
        title: typeof lastUserMessage.content === 'string' 
          ? lastUserMessage.content.substring(0, 100) 
          : 'New chat'
      });
      console.log('✅ Chat API: New chat created:', { id });
    } else if (chat.userId !== user.id) {
      console.log('❌ Chat API: Unauthorized - chat belongs to different user');
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('💾 Chat API: Saving message');
    await saveMessages({
      messages: [{
        id: userMessageId,
        chatId: id,
        role: lastUserMessage.role,
        content: lastUserMessage.content,
        createdAt: new Date(),
      }]
    });
    console.log('✅ Chat API: Message saved successfully');

    return createDataStreamResponse({
      execute: async (dataStream: DataStreamWriter) => {
        dataStream.writeData({
          type: 'user-message-id',
          content: userMessageId,
        });

        const stream = await streamText({
          model: customModel(model.apiIdentifier),
          system: getSystemPrompt(mike),
          messages: coreMessages,
          onFinish: async ({ response }) => {
            try {
              await saveMessages({
                messages: [{
                  id: generateUUID(),
                  chatId: id,
                  role: 'assistant',
                  content: response.messages[response.messages.length - 1].content,
                  createdAt: new Date(),
                }]
              });
              console.log('✅ Chat API: Assistant message saved successfully');
            } catch (error) {
              console.error('❌ Chat API: Failed to save assistant message:', error);
            }
          }
        });

        stream.mergeIntoDataStream(dataStream);
      }
    });
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Missing chat ID', { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwks = await getJwks();
    const verified = await verifyJwt(token, jwks);
    
    if (!verified) {
      return new Response('Unauthorized', { status: 401 });
    }

    const chat = await getChatById({ id });
    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== verified.sub) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChat({ id });
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('📥 Chat GET request:', { 
      id,
      url: request.url,
      timestamp: new Date().toISOString()
    });

    if (!id) {
      console.log('❌ Missing chat ID');
      return new Response('Missing chat ID', { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header:', {
      exists: !!authHeader,
      type: authHeader?.split(' ')[0],
      truncatedToken: authHeader?.split(' ')[1]?.substring(0, 10) + '...'
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid auth header format');
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwks = await getJwks();
    const verified = await verifyJwt(token, jwks);
    
    console.log('🔐 Token verification:', {
      verified: !!verified,
      userId: verified?.sub
    });
    
    if (!verified) {
      console.log('❌ Token verification failed');
      return new Response('Unauthorized', { status: 401 });
    }

    const chat = await getChatById({ id });
    console.log('💬 Chat lookup:', {
      found: !!chat,
      chatUserId: chat?.userId,
      requestUserId: verified.sub,
      visibility: chat?.visibility
    });

    if (!chat) {
      console.log('❌ Chat not found');
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== verified.sub && chat.visibility !== 'public') {
      console.log('❌ Unauthorized access attempt');
      return new Response('Unauthorized', { status: 401 });
    }

    const messages = await getMessagesByChatId({ id });
    console.log('✅ Successfully retrieved chat:', {
      messageCount: messages.length
    });

    return new Response(JSON.stringify({ chat, messages }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error getting chat:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 