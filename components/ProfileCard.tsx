'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { stringToColor } from '@/lib/utils';

const AUTHOR_NAME_KEY = 'mywall_author_name';
const DEFAULT_AUTHOR = 'Jinwoo';

export default function ProfileCard({ postCount }: { postCount: number }) {
  const [authorName, setAuthorName] = useState(DEFAULT_AUTHOR);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(DEFAULT_AUTHOR);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load author name from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(AUTHOR_NAME_KEY);
        if (saved) {
          setAuthorName(saved);
          setEditValue(saved);
        }
      }
    } catch (e) {
      console.error('Failed to load author name:', e);
    }
  }, []);

  // Load profile image from Supabase
  useEffect(() => {
    loadProfileImage();
  }, [authorName]);

  const loadProfileImage = async () => {
    if (!supabase) return;
    
    const fileName = `${authorName.toLowerCase()}.jpg`;
    const { data } = await supabase
      .storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    if (data?.publicUrl) {
      // Check if file exists by making a HEAD request
      try {
        const response = await fetch(data.publicUrl, { method: 'HEAD', cache: 'no-store' });
        if (response.ok) {
          // Add timestamp to prevent caching
          setProfileImage(`${data.publicUrl}?t=${Date.now()}`);
        } else {
          // File doesn't exist (404) or forbidden (403/400)
          setProfileImage(null);
        }
      } catch (e) {
        // Network error or other issue, assume no image
        setProfileImage(null);
      }
    } else {
      setProfileImage(null);
    }
  };

  const handleSave = () => {
    const trimmed = editValue.trim().slice(0, 30);
    if (trimmed) {
      setAuthorName(trimmed);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTHOR_NAME_KEY, trimmed);
        }
      } catch (e) {
        console.error('Failed to save author name:', e);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(authorName);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      if (!supabase) {
        alert('Supabase is not configured');
        return;
      }

      const fileName = `${authorName.toLowerCase()}.jpg`;
      const { error: uploadError } = await supabase
        .storage
        .from('profile-images')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Reload the image to get the new URL
      await loadProfileImage();
    } catch (e) {
      console.error('Failed to upload profile image:', e);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      if (!supabase) {
        alert('Supabase is not configured');
        return;
      }

      const fileName = `${authorName.toLowerCase()}.jpg`;
      const { error: deleteError } = await supabase
        .storage
        .from('profile-images')
        .remove([fileName]);

      if (deleteError) {
        console.error('Failed to delete profile image:', deleteError);
        alert('Failed to remove photo');
        return;
      }

      setProfileImage(null);
    } catch (e) {
      console.error('Failed to remove profile image:', e);
      alert('Failed to remove photo');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageError = () => {
    setProfileImage(null);
  };

  const avatarColor = stringToColor(authorName);

  return (
    <div className="panel-2008 p-8 hidden lg:block">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative group">
          {profileImage ? (
            <img
              src={profileImage}
              alt={authorName}
              className="w-20 h-20 flex-shrink-0 object-cover rounded-sm"
              onError={handleImageError}
            />
          ) : (
            <div 
              className="w-20 h-20 flex-shrink-0 flex items-center justify-center text-white font-bold text-3xl rounded-sm"
              style={{ backgroundColor: avatarColor }}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-white text-xs px-1"
              disabled={isUploading}
              title="Change photo"
            >
              {isUploading ? '…' : '📷'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value.slice(0, 30))}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                maxLength={30}
                className="flex-1 px-2 py-1 border border-panel-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-link"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="button-2008 text-white px-2 py-1 text-xs"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="font-bold text-text-primary text-base">{authorName}</div>
          )}
        </div>
      </div>
      
      <div className="flex gap-1.5 mb-4">
        <button
          onClick={() => setIsEditing(true)}
          className="button-2008 text-white px-2 py-1 text-xs flex-1"
        >
          Edit name
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="button-2008 text-white px-2 py-1 text-xs flex-1"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading…' : profileImage ? 'Change photo' : 'Upload photo'}
        </button>
        <button
          onClick={handleRemoveImage}
          className="button-2008 text-white px-2 py-1 text-xs flex-1"
        >
          Remove photo
        </button>
      </div>
      
      <div className="text-xs text-text-secondary space-y-1 pt-3 border-t border-panel-border">
        <div>
          <span className="font-medium">{postCount}</span> post{postCount !== 1 ? 's' : ''}
        </div>
        <div>Member since today</div>
      </div>
    </div>
  );
}
