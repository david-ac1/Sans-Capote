/**
 * Supabase client for database operations
 * Used for storing community ratings and other persistent data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key';

if (!isConfigured && typeof window !== 'undefined') {
  console.warn('⚠️ Supabase credentials not configured. Ratings will not be persisted.');
}

// Create client with fallback for build time
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = () => isConfigured;

/**
 * Database types
 */
export interface ServiceRating {
  id?: string;
  service_id: string;
  friendliness: number;
  privacy: number;
  wait_time: number;
  inclusive_care: number;
  judgement_free: boolean;
  comment?: string;
  created_at?: string;
}

export interface ServiceRatingAggregate {
  service_id: string;
  avg_friendliness: number;
  avg_privacy: number;
  avg_wait_time: number;
  avg_inclusive_care: number;
  judgement_free_percentage: number;
  total_ratings: number;
}

/**
 * Submit a new service rating
 */
export async function submitServiceRating(rating: Omit<ServiceRating, 'id' | 'created_at'>) {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('service_ratings')
      .insert([rating])
      .select()
      .single();

    if (error) {
      console.error('Failed to submit rating:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Exception submitting rating:', err);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get aggregated ratings for a service
 */
export async function getServiceRatings(serviceId: string): Promise<ServiceRatingAggregate | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('service_ratings')
      .select('*')
      .eq('service_id', serviceId);

    if (error) {
      console.error('Failed to fetch ratings:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Calculate aggregates
    const total = data.length;
    const sumFriendliness = data.reduce((sum, r) => sum + r.friendliness, 0);
    const sumPrivacy = data.reduce((sum, r) => sum + r.privacy, 0);
    const sumWaitTime = data.reduce((sum, r) => sum + r.wait_time, 0);
    const sumInclusiveCare = data.reduce((sum, r) => sum + r.inclusive_care, 0);
    const judgementFreeCount = data.filter(r => r.judgement_free).length;

    return {
      service_id: serviceId,
      avg_friendliness: sumFriendliness / total,
      avg_privacy: sumPrivacy / total,
      avg_wait_time: sumWaitTime / total,
      avg_inclusive_care: sumInclusiveCare / total,
      judgement_free_percentage: (judgementFreeCount / total) * 100,
      total_ratings: total,
    };
  } catch (err) {
    console.error('Exception fetching ratings:', err);
    return null;
  }
}

/**
 * Get recent ratings with comments for a service
 */
export async function getServiceRatingComments(serviceId: string, limit = 10) {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('service_ratings')
      .select('friendliness, privacy, wait_time, judgement_free, comment, created_at')
      .eq('service_id', serviceId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch rating comments:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching rating comments:', err);
    return [];
  }
}
