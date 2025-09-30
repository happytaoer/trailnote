export interface Feedback {
  id: string;
  user_id: string;
  content: string;
  type: 'suggestion' | 'bug' | 'feature' | 'other';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackData {
  content: string;
  type: 'suggestion' | 'bug' | 'feature' | 'other';
}

export interface UpdateFeedbackData {
  content?: string;
  type?: 'suggestion' | 'bug' | 'feature' | 'other';
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
}
