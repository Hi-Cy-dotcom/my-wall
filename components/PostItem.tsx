'use client';

import { useNow } from '@/hooks/useNow';
import { getRelativeTime, getFullDate, stringToColor, getProfileImage } from '@/lib/utils';
import { Post } from '@/types';
import { useState, useEffect } from 'react';

interface PostItemProps {
  post: Post;
  isNew?: boolean;
  isSending?: boolean;
}

export default function PostItem({ post, isNew = false, isSending = false }: PostItemProps) {
  const now = useNow();
  const relativeTime = getRelativeTime(post.created_at);
  const fullDate = getFullDate(post.created_at);
  const avatarColor = stringToColor(post.author);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load profile image for this author
  useEffect(() => {
    let mounted = true;
    
    getProfileImage(post.author).then((image) => {
      if (mounted) {
        setProfileImage(image);
      }
    });

    return () => {
      mounted = false;
    };
  }, [post.author]);

  return (
    <div 
      className={`panel-2008 p-4 mb-3 ${isNew ? 'slide-in new-post-flash' : ''}`}
      style={{ fontFamily: '"Lucida Grande", Tahoma, Verdana, sans-serif', fontSize: '13px' }}
    >
      <div className="flex gap-3">
        {profileImage ? (
          <img
            src={profileImage}
            alt={post.author}
            className="w-10 h-10 flex-shrink-0 object-cover rounded-sm"
            style={{ width: '40px', height: '40px' }}
          />
        ) : (
          <div 
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm rounded-sm"
            style={{ 
              width: '40px', 
              height: '40px',
              backgroundColor: avatarColor 
            }}
          >
            {post.author.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <span 
              className="font-bold"
              style={{ color: '#3b5998' }}
            >
              {post.author}
            </span>
            {isSending && (
              <span className="ml-2 text-xs text-gray-500 italic">Sending…</span>
            )}
          </div>
          <div 
            className="whitespace-pre-wrap break-words"
            style={{ color: '#333333', lineHeight: '1.4' }}
          >
            {post.message}
          </div>
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post image"
              className="mt-2 max-w-full h-auto rounded-sm"
              style={{ maxHeight: '400px' }}
            />
          )}
          <div className="mt-2 text-xs" style={{ color: '#666666' }}>
            <time dateTime={post.created_at} title={fullDate}>
              {relativeTime}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}
