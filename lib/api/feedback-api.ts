import { supabase } from '@/lib/supabase';
import type { Feedback, CreateFeedbackData } from '@/types';

export const feedbackApi = {
  /**
   * Create new feedback
   */
  async createFeedback(data: CreateFeedbackData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const feedbackData = {
      user_id: user.id,
      content: data.content,
      type: data.type,
    };

    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();

    return { data: feedback, error };
  },

  /**
   * Get user's feedback history
   */
  async getUserFeedback() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * Get feedback by ID
   */
  async getFeedbackById(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    return { data, error };
  },
};
