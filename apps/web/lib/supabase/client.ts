'use client';
import { createBrowserClient } from '@supabase/ssr';
import { novaConfig } from '../config';
export function createSupabaseBrowserClient(){
  return createBrowserClient(novaConfig.supabaseUrl, novaConfig.supabaseAnonKey);
}
