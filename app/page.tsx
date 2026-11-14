'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import Header from '@/components/Header';
import ShareBox from '@/components/ShareBox';
import Feed from '@/components/Feed';
import ProfileCard from '@/components/ProfileCard';
import NewPostsPill from '@/components/NewPostsPill';
import { usePosts } from '@/hooks/usePosts';

const AUTHOR_NAME_KEY = 'mywall_author_name';
const DEFAULT_AUTHOR = 'Jinwoo';

export default function Home() {
  const [authorName, setAuthorName] = useState(DEFAULT_AUTHOR);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [optimisticPost, setOptimisticPost] = useState<Post | null>(null);

  const {
    posts,
    loading,
    error,
    hasMore,
    connectionStatus,
    newPostsCount,
    addOptimisticPost,
    removeOptimisticPost,
    addPost,
    fetchPosts,
    loadMore,
    scrollToTop,
  } = usePosts(authorName);

  // Load author name from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(AUTHOR_NAME_KEY);
        if (saved) {
          setAuthorName(saved);
        }
      }
    } catch (e) {
      console.error('Failed to load author name:', e);
    }
  }, []);

  const handleShare = async (message: string, imageFile?: File) => {
    if (!supabase) {
      setShareError('Supabase is not configured. Please set environment variables.');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempPost: Post = {
      id: tempId,
      author: authorName,
      message,
      created_at: new Date().toISOString(),
    };

    try {
      setIsSharing(true);
      setShareError(null);
      
      // Optimistic insert
      addOptimisticPost(tempPost);
      setOptimisticPost(tempPost);

      let imageUrl: string | null = null;
      
      // Upload image if provided
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('profile-images')
          .upload(fileName, imageFile, {
            contentType: imageFile.type,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          author: authorName,
          message: message,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Replace optimistic post with real one
      removeOptimisticPost(tempId);
      setOptimisticPost(null);
      
      // Add the real post to the feed immediately
      if (data) {
        addPost(data);
      }
    } catch (err) {
      console.error('Error sharing post:', err);
      removeOptimisticPost(tempId);
      setOptimisticPost(null);
      setShareError('Failed to share your post. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handlePosted = () => {
    // Trigger refetch to ensure we have the latest state
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#edeff4', fontFamily: '"Lucida Grande", Tahoma, Verdana, sans-serif' }}
    >
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left sidebar - Profile Card (desktop only) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProfileCard postCount={posts.length} />
          </aside>

          {/* Main content */}
          <div className="flex-1 max-w-[640px]">
            <ShareBox onShare={handleShare} isSharing={isSharing} onPosted={handlePosted} />
            
            {shareError && (
              <div 
                className="panel-2008 p-4 mb-3"
                style={{ backgroundColor: '#ffebee', borderColor: '#ef9a9a' }}
                role="alert"
                aria-live="assertive"
              >
                <p style={{ color: '#c62828', fontSize: '13px' }}>{shareError}</p>
              </div>
            )}
            
            <Feed 
              posts={posts}
              loading={loading}
              error={error}
              hasMore={hasMore}
              connectionStatus={connectionStatus}
              newPostsCount={newPostsCount}
              fetchPosts={fetchPosts}
              loadMore={loadMore}
              scrollToTop={scrollToTop}
            />
          </div>
        </div>
      </main>

      <NewPostsPill count={newPostsCount} onClick={scrollToTop} />
    </div>
  );
}
