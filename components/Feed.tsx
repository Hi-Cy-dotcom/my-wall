'use client';

import { Post } from '@/types';
import PostItem from './PostItem';
import PostSkeleton from './PostSkeleton';
import LiveStatus from './LiveStatus';

interface FeedProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  newPostsCount: number;
  fetchPosts: () => Promise<void>;
  loadMore: () => Promise<void>;
  scrollToTop: () => void;
}

export default function Feed({ 
  posts, 
  loading, 
  error, 
  hasMore, 
  connectionStatus, 
  newPostsCount, 
  fetchPosts, 
  loadMore, 
  scrollToTop 
}: FeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-2008 p-6 text-center">
        <p className="text-red-600 mb-3" style={{ fontFamily: '"Lucida Grande", Tahoma, Verdana, sans-serif' }}>
          {error}
        </p>
        <button 
          onClick={fetchPosts}
          className="button-2008 text-white text-sm px-4 py-1.5"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div 
        className="panel-2008 p-8 text-center"
        style={{ fontFamily: '"Lucida Grande", Tahoma, Verdana, sans-serif', fontSize: '13px' }}
      >
        <p style={{ color: '#666666' }}>
          No posts yet. Be the first to share!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3 px-1">
        <LiveStatus status={connectionStatus} />
        {newPostsCount > 0 && (
          <button
            onClick={scrollToTop}
            className="text-xs text-link hover:underline"
            style={{ fontFamily: '"Lucida Grande", Tahoma, Verdana, sans-serif' }}
          >
            ↑ {newPostsCount} new post{newPostsCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>
      
      <div aria-live="polite">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="button-2008 text-white text-sm px-4 py-1.5 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Show older posts'}
          </button>
        </div>
      )}
    </div>
  );
}
