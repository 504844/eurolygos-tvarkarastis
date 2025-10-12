import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase configuration is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserPreferences {
  id?: string;
  user_id: string;
  view_mode: 'grid' | 'compact' | 'timeline';
  grid_density: 'comfortable' | 'compact' | 'spacious';
  favorite_teams: string[];
  theme_preference: 'auto' | 'light' | 'dark';
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }

  return data;
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert(preferences, { onConflict: 'user_id' });

  if (error) {
    console.error('Error saving user preferences:', error);
  }
}

export function generateUserId(): string {
  let userId = localStorage.getItem('schedule_user_id');
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
    localStorage.setItem('schedule_user_id', userId);
  }
  return userId;
}
