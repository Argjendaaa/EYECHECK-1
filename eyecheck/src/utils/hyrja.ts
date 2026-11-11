import { supabase } from './supabase';

export const krijoLlogari = (email: string, password: string) =>
  supabase.auth.signUp({ email, password });

export const hyr = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const dil = () => supabase.auth.signOut();
