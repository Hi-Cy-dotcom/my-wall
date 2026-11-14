import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';

const INITIAL_LIMIT = 50;
const PAGINATION_LIMIT = 20;

// Global singleton for Supabase realtime channel
let globalChannel: any = null;
let globalCallbacks: {
  onNewPost: ((post: Post) => void) | null;
  onScrollDown: (() => void) | null;
} = {
  onNewPost: null,
  onScrollDown: null,
};

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  newPostsCount: number;
  fetchPosts: () => Promise<void>;
  loadMore: () => Promise<void>;
  addOptimisticPost: (post: Post) => void;
  removeOptimisticPost: (tempId: string) => void;
  addPost: (post: Post) => void;
  scrollToTop: () => void;
}

export function usePosts(authorName: string): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [newPostsCount, setNewPostsCount] = useState(0);
  
  const lastCreatedAtRef = useRef<string | null>(null);
  const isScrolledDownRef = useRef(false);

  // Check if user is scrolled down
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 100;
      isScrolledDownRef.current = window.scrollY > threshold;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPosts = useCallback(async (cursor: string | null = null) => {
    if (!supabase) {
      setError('Supabase is not configured');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(cursor ? PAGINATION_LIMIT : INITIAL_LIMIT);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (data) {
        if (cursor) {
          setPosts((prev) => [...prev, ...data]);
        } else {
          setPosts(data);
        }
        
        setHasMore(data.length === (cursor ? PAGINATION_LIMIT : INITIAL_LIMIT));
        if (data.length > 0) {
          lastCreatedAtRef.current = data[data.length - 1].created_at;
        }
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !lastCreatedAtRef.current) return;
    await fetchPosts(lastCreatedAtRef.current);
  }, [loading, hasMore, fetchPosts]);

  const addOptimisticPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const removeOptimisticPost = useCallback((tempId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== tempId));
  }, []);

  const addPost = useCallback((post: Post) => {
    setPosts((prev) => {
      // Dedupe by id
      if (prev.some((p) => p.id === post.id)) {
        return prev;
      }
      return [post, ...prev];
    });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNewPostsCount(0);
  }, []);

  // Realtime subscription - global singleton pattern
  useEffect(() => {
    // Register callbacks for this component instance
    globalCallbacks.onNewPost = (newPost: Post) => {
      setPosts((currentPosts: Post[]) => {
        // Dedupe by id to avoid duplicates from our own insert
        if (currentPosts.some((p) => p.id === newPost.id)) {
          return currentPosts;
        }
        return [newPost, ...currentPosts];
      });
    };

    globalCallbacks.onScrollDown = () => {
      setNewPostsCount((prev: number) => prev + 1);
    };

    // Initialize global channel if not exists
    if (!globalChannel && supabase) {
      const channelName = 'posts-realtime';
      
      globalChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'posts',
          },
          (payload: any) => {
            const newPost = payload.new as Post;
            
            // Call registered callback
            if (globalCallbacks.onNewPost) {
              globalCallbacks.onNewPost(newPost);
            }

            // Show new posts pill if scrolled down
            if (isScrolledDownRef.current && globalCallbacks.onScrollDown) {
              globalCallbacks.onScrollDown();
            }
          }
        )
        .subscribe((status: any) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setConnectionStatus('disconnected');
          } else if (status === 'TIMED_OUT' || status === 'SUBSCRIPTION_ERROR') {
            setConnectionStatus('reconnecting');
          }
        });
    }

    return () => {
      // Unregister callbacks on unmount
      globalCallbacks.onNewPost = null;
      globalCallbacks.onScrollDown = null;
      
      // Note: We don't cleanup the global channel to handle Strict Mode
      // The channel persists across remounts
    };
  }, []); // Empty dependency array - subscribe only once

  // Refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && connectionStatus === 'connected') {
        fetchPosts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectionStatus, fetchPosts]);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    connectionStatus,
    newPostsCount,
    fetchPosts,
    loadMore,
    addOptimisticPost,
    removeOptimisticPost,
    addPost,
    scrollToTop,
  };
}
