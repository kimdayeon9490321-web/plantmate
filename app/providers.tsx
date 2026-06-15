'use client';

import { createBrowserClient } from '@supabase/ssr';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

interface AuthContextType {
  supabase: ReturnType<typeof createBrowserClient>;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useSupabase() {
  return getSupabaseClient();
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within SupabaseProvider');
  }
  return context;
}

export function useSession() {
  const { session } = useAuthContext();
  return session;
}

export function useSupabaseClient() {
  return getSupabaseClient();
}

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseClient = getSupabaseClient();

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then((result: any) => {
      setSession(result.data.session);
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabaseClient]);

  return (
    <AuthContext.Provider value={{ supabase: supabaseClient, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
