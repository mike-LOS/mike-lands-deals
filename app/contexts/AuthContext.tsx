'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import type { ReactNode } from 'react'

// Define our User type
interface User {
  id: string
  email: string | null
  walletAddress: string | null
  walletPublicKey: string | null
  token?: string // Add token to user type
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  logout: async () => {}
})

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const isMountedRef = useRef(false)
  const lastUserRef = useRef<string | null>(null)
  const lastAuthStateRef = useRef<{ready: boolean; authenticated: boolean; userId?: string} | null>(null)
  
  const { 
    ready,
    authenticated,
    user,
    logout: privyLogout,
    getAccessToken
  } = usePrivy()

  const { wallets } = useWallets()
  const primaryWallet = wallets?.[0] // Use first wallet as primary

  const transformUserData = useCallback((): User | null => {
    if (!user || !authenticated) return null;

    const transformed = {
      id: user.id,
      email: typeof user.email === 'string' ? user.email : null,
      walletAddress: primaryWallet?.address || null,
      walletPublicKey: primaryWallet?.address || null
    };

    return transformed;
  }, [user, authenticated, primaryWallet]);

  const syncUserWithDatabase = useCallback(async (userData: User) => {
    if (!isMountedRef.current) {
      console.log('⚠️ Component not mounted, skipping sync');
      return null;
    }

    // Prevent duplicate syncs
    const userDataString = JSON.stringify(userData)
    if (userDataString === lastUserRef.current) {
      console.log('⚠️ Duplicate sync detected, skipping');
      return null
    }
    lastUserRef.current = userDataString

    try {
      console.log('🔄 Attempting to sync user with database:', {
        id: userData.id,
        walletPublicKey: userData.walletPublicKey,
      });

      // Get JWT token from Privy
      const token = await getAccessToken();

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...userData,
          token // Include token in sync data
        }),
      });

      console.log('📡 Sync response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Sync response error:', errorData);
        throw new Error('Failed to sync user with database');
      }

      const data = await response.json();
      
      if (isMountedRef.current) {
        console.log('✅ User synced successfully:', data.user);
        // Store token with user data
        return {
          ...data.user,
          token
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error syncing user with database:', error);
      return null;
    }
  }, [getAccessToken]);

  const handleAuthStateChange = useCallback(async () => {
    // Check if auth state has actually changed
    const currentAuthState = { ready, authenticated, userId: user?.id };
    const lastAuthState = lastAuthStateRef.current;
    
    if (lastAuthState && 
        lastAuthState.ready === currentAuthState.ready && 
        lastAuthState.authenticated === currentAuthState.authenticated && 
        lastAuthState.userId === currentAuthState.userId) {
      return; // Skip if no actual change
    }
    
    lastAuthStateRef.current = currentAuthState;
    
    console.log('🔄 Auth state changed:', currentAuthState);
    
    if (!ready) {
      console.log('⚠️ Privy not ready, waiting...');
      return;
    }

    if (authenticated && user) {
      console.log('👤 User is authenticated, transforming data');
      const transformedUser = transformUserData();
      if (transformedUser) {
        console.log('🔄 Starting user sync');
        const syncedUser = await syncUserWithDatabase(transformedUser);
        if (isMountedRef.current) {
          setCurrentUser(syncedUser || transformedUser);
        }
      }
    } else {
      console.log('🚫 User not authenticated, clearing user data');
      if (isMountedRef.current) {
        setCurrentUser(null);
      }
    }
    
    if (isMountedRef.current) {
      setLoading(false);
    }
  }, [ready, authenticated, user, transformUserData, syncUserWithDatabase]);

  const logout = useCallback(async () => {
    try {
      console.log('🔐 Initiating logout')
      setLoading(true)
      lastUserRef.current = null
      await privyLogout()
      setCurrentUser(null)
      console.log('✅ Logout successful')
    } catch (error) {
      console.error('❌ Logout error:', error)
    } finally {
      setLoading(false)
    }
  }, [privyLogout])

  // Memoize the auth value to prevent unnecessary re-renders
  const authValue = useMemo(() => ({
    isAuthenticated: !!currentUser && !loading,
    user: currentUser,
    loading,
    logout
  }), [currentUser, loading, logout])

  // Handle auth state changes
  useEffect(() => {
    if (!isMountedRef.current) return;
    handleAuthStateChange();
  }, [handleAuthStateChange]);

  // Handle component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 