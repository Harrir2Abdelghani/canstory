import { supabase } from '../lib/supabase';
import { CancerType, ContentStatus } from '../types';

export class ApiService {
  static async getArticles(filters?: {
    cancer_type?: CancerType;
    status?: ContentStatus;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('articles')
      .select('*, author:users!articles_author_id_fkey(id, full_name, avatar_url, role)')
      .order('published_at', { ascending: false });

    if (filters?.cancer_type) {
      query = query.contains('cancer_types', [filters.cancer_type]);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'published');
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  static async getArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*, author:users!articles_author_id_fkey(id, full_name, avatar_url, role)')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    await supabase
      .from('articles')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id);

    return data;
  }

  static async getCommunityPosts(filters?: {
    cancer_type?: CancerType;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('community_posts')
      .select('*, user:users!community_posts_user_id_fkey(id, full_name, avatar_url, role)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (filters?.cancer_type) {
      query = query.eq('cancer_type', filters.cancer_type);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  static async createCommunityPost(post: {
    title: string;
    content: string;
    cancer_type?: CancerType;
    tags?: string[];
    is_anonymous?: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        ...post,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getNotifications(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  static async markAllNotificationsAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
  }

  static async getUserDirectory(filters?: {
    role?: string;
    wilaya?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('user_directory')
      .select('*')
      .order('full_name', { ascending: true });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.wilaya) {
      query = query.eq('wilaya', filters.wilaya);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  static async toggleLike(likeableType: string, likeableId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('likeable_type', likeableType)
      .eq('likeable_id', likeableId)
      .single();

    if (existingLike) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) throw error;
      return { liked: false };
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          likeable_type: likeableType,
          likeable_id: likeableId,
        });

      if (error) throw error;
      return { liked: true };
    }
  }

  static async toggleBookmark(bookmarkableType: string, bookmarkableId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('bookmarkable_type', bookmarkableType)
      .eq('bookmarkable_id', bookmarkableId)
      .single();

    if (existingBookmark) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);

      if (error) throw error;
      return { bookmarked: false };
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          bookmarkable_type: bookmarkableType,
          bookmarkable_id: bookmarkableId,
        });

      if (error) throw error;
      return { bookmarked: true };
    }
  }

  static subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }

  static subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }

  // Generic GET request method for custom endpoints
  static async get(endpoint: string) {
    // For mobile, use the environment variable or default to localhost
    // Note: localhost on iOS simulator = localhost, on Android emulator = 10.0.2.2
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('API Request:', `${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // About page endpoints - using Supabase directly
  static async getAboutSections() {
    const { data, error } = await supabase
      .from('about_page')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getTeamMembers() {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getContactInfo() {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }
}
