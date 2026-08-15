import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppData } from '../types';

/**
 * 可选云同步层（Supabase）。
 * 设计：把整个 AppData 作为一条 JSON 文档，按用户 id 存到 app_state 表，
 * last-write-wins。未配置 Supabase 时，App 完全本地可用，不受影响。
 */

const KEY_URL = 'supabase_url';
const KEY_ANON = 'supabase_anon_key';
const KEY_UID = 'supabase_uid';
const KEY_EMAIL = 'supabase_email';

let client: SupabaseClient | null = null;

export async function loadConfig(): Promise<{ url: string; anonKey: string } | null> {
  const url = await AsyncStorage.getItem(KEY_URL);
  const anon = await AsyncStorage.getItem(KEY_ANON);
  if (url && anon) {
    client = createClient(url, anon);
    return { url, anonKey: anon };
  }
  return null;
}

export async function configure(url: string, anonKey: string): Promise<void> {
  client = createClient(url, anonKey);
  await AsyncStorage.setItem(KEY_URL, url);
  await AsyncStorage.setItem(KEY_ANON, anonKey);
}

export async function getSessionEmail(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_EMAIL);
}

export async function signUp(email: string, password: string): Promise<string | null> {
  if (!client) return '请先填写并保存 Supabase 地址与 Key';
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) return error.message;
  if (data.user) {
    await AsyncStorage.setItem(KEY_UID, data.user.id);
    await AsyncStorage.setItem(KEY_EMAIL, email);
  }
  return null;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  if (!client) return '请先填写并保存 Supabase 地址与 Key';
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return error.message;
  if (data.user) {
    await AsyncStorage.setItem(KEY_UID, data.user.id);
    await AsyncStorage.setItem(KEY_EMAIL, email);
  }
  return null;
}

export async function signOut(): Promise<void> {
  if (client) await client.auth.signOut();
  await AsyncStorage.removeItem(KEY_UID);
  await AsyncStorage.removeItem(KEY_EMAIL);
}

async function getUid(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_UID);
}

export async function pushState(data: AppData): Promise<string | null> {
  if (!client) return '未配置 Supabase';
  const uid = await getUid();
  if (!uid) return '请先登录';
  const { error } = await client
    .from('app_state')
    .upsert({ user_id: uid, data, updated_at: new Date().toISOString() });
  return error ? error.message : null;
}

export async function pullState(): Promise<{ error: string | null; data: AppData | null }> {
  if (!client) return { error: '未配置 Supabase', data: null };
  const uid = await getUid();
  if (!uid) return { error: '请先登录', data: null };
  const { data, error } = await client
    .from('app_state')
    .select('data')
    .eq('user_id', uid)
    .single();
  if (error) return { error: error.message, data: null };
  return { error: null, data: (data?.data as AppData) ?? null };
}
