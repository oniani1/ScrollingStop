import { supabase } from '../config/supabase';
import type { Warrior, WarPair, WarEvent } from '../types/models';
import type { RealtimeChannel } from '@supabase/supabase-js';

function ensureSupabase() {
  if (!supabase) throw new Error('Supabase is not configured. Set your project credentials in src/config/supabase.ts');
  return supabase;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function registerWarrior(displayName: string): Promise<Warrior | null> {
  const sb = ensureSupabase();
  const deviceCode = generateUUID();
  const { data, error } = await sb
    .from('warriors')
    .insert({ device_code: deviceCode, display_name: displayName })
    .select()
    .single();

  if (error) {
    console.warn('registerWarrior error:', error.message);
    return null;
  }
  return data as Warrior;
}

export async function createWarPair(warriorId: string): Promise<{ pairCode: string; pairId: string } | null> {
  const sb = ensureSupabase();
  const pairCode = generateCode();
  const { data, error } = await sb
    .from('war_pairs')
    .insert({
      warrior_a: warriorId,
      pair_code: pairCode,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.warn('createWarPair error:', error.message);
    return null;
  }
  return { pairCode: data.pair_code, pairId: data.id };
}

export async function joinWarPair(
  pairCode: string,
  warriorId: string,
): Promise<WarPair | null> {
  const sb = ensureSupabase();
  // Find the pair
  const { data: pair, error: findError } = await sb
    .from('war_pairs')
    .select('*')
    .eq('pair_code', pairCode)
    .eq('active', true)
    .is('warrior_b', null)
    .single();

  if (findError || !pair) {
    console.warn('joinWarPair find error:', findError?.message);
    return null;
  }

  // Join it
  const { data, error } = await sb
    .from('war_pairs')
    .update({ warrior_b: warriorId })
    .eq('id', pair.id)
    .select()
    .single();

  if (error) {
    console.warn('joinWarPair update error:', error.message);
    return null;
  }
  return data as WarPair;
}

export async function leavePair(pairId: string): Promise<boolean> {
  const sb = ensureSupabase();
  const { error } = await sb
    .from('war_pairs')
    .update({ active: false })
    .eq('id', pairId);

  if (error) {
    console.warn('leavePair error:', error.message);
    return false;
  }
  return true;
}

export async function sendWarEvent(
  pairId: string,
  warriorId: string,
  eventType: WarEvent['event_type'],
  data: Record<string, unknown> = {},
): Promise<void> {
  const sb = ensureSupabase();
  const { error } = await sb
    .from('war_events')
    .insert({ pair_id: pairId, warrior_id: warriorId, event_type: eventType, data });

  if (error) console.warn('sendWarEvent error:', error.message);
}

export async function getPartnerEvents(
  pairId: string,
  partnerId: string,
  limit = 20,
): Promise<WarEvent[]> {
  const sb = ensureSupabase();
  const { data, error } = await sb
    .from('war_events')
    .select('*')
    .eq('pair_id', pairId)
    .eq('warrior_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('getPartnerEvents error:', error.message);
    return [];
  }
  return (data as WarEvent[]) || [];
}

export async function getPartnerName(partnerId: string): Promise<string | null> {
  const sb = ensureSupabase();
  const { data, error } = await sb
    .from('warriors')
    .select('display_name')
    .eq('id', partnerId)
    .single();

  if (error) return null;
  return data?.display_name ?? null;
}

export function subscribeToEvents(
  pairId: string,
  callback: (event: WarEvent) => void,
): RealtimeChannel | null {
  if (!supabase) return null;
  return supabase
    .channel(`war_events:${pairId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'war_events',
        filter: `pair_id=eq.${pairId}`,
      },
      (payload) => {
        callback(payload.new as WarEvent);
      },
    )
    .subscribe();
}
