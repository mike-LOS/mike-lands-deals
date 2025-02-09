import { db } from '../index';
import { eq } from 'drizzle-orm';
import { users } from '../schema';

export interface PrivyUser {
  id: string;
  email: string | null;
  walletAddress: string | null;
  walletPublicKey: string | null;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export async function getUser(userId: string): Promise<PrivyUser | null> {
  try {
    console.log('🔍 Getting user from database:', userId);
    
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('❌ Error getting user:', error);
    throw error;
  }
}

export async function getUserByWalletAddress(walletAddress: string): Promise<PrivyUser | null> {
  try {
    console.log('🔍 Getting user by wallet address:', walletAddress);
    
    const result = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('❌ Error getting user by wallet:', error);
    throw error;
  }
}

export async function createOrUpdateUser(user: {
  id: string;
  email?: string | null;
  walletAddress?: string | null;
  walletPublicKey?: string | null;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}): Promise<PrivyUser> {
  try {
    console.log('🔄 Creating/updating user in database:', {
      ...user,
      updatedAt: new Date()
    });

    // First try to get the existing user
    const existingUser = await getUser(user.id);
    
    if (existingUser) {
      // Update existing user
      console.log('🔄 Updating existing user:', existingUser.id);
      const [updated] = await db
        .update(users)
        .set({
          email: user.email,
          walletAddress: user.walletAddress,
          walletPublicKey: user.walletPublicKey,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id))
        .returning();
      
      console.log('✅ User updated successfully:', updated);
      return updated;
    } else {
      // Insert new user
      console.log('🔄 Creating new user');
      const [created] = await db
        .insert(users)
        .values({
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress,
          walletPublicKey: user.walletPublicKey,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log('✅ User created successfully:', created);
      return created;
    }
  } catch (error) {
    console.error('❌ Database error in createOrUpdateUser:', error);
    throw error;
  }
} 