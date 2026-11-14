'use client';

import { useState, useEffect, useRef } from 'react';
import { useDraft } from '@/hooks/useDraft';

interface ShareBoxProps {
  onShare: (message: string, imageFile?: File) => Promise<void>;
  isSharing: boolean;
  onPosted?: () => void;
}

const MAX_CHARS = 280;
const WARNING_THRESHOLD = 240;
const DANGER_THRESHOLD = 270;
const COOLDOWN_MS = 2000;

export default function ShareBox({ onShare, isSharing, onPosted }: ShareBoxProps) {
  const { draft, saveDraft, clearDraft } = useDraft();
  const [message, setMessage] = useState(draft);
  const [showPosted, setShowPosted] = useState(false);
  const [inCooldown, setInCooldown] = useState(false);
  const [previousAnnouncedThreshold, setPreviousAnnouncedThreshold] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isDanger = charCount >= DANGER_THRESHOLD;
  const isWarning = charCount >= WARNING_THRESHOLD;
  const trimmedMessage = message.trim();
  const canShare = trimmedMessage.length > 0 && charCount <= MAX_CHARS && !isSharing && !inCooldown;

  // Load draft on mount
  useEffect(() => {
    setMessage(draft);
  }, [draft]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Announce counter thresholds
  useEffect(() => {
    if (charCount === 0) {
      setPreviousAnnouncedThreshold(0);
      return;
    }

    let newThreshold = previousAnnouncedThreshold;
    if (charCount >= WARNING_THRESHOLD && previousAnnouncedThreshold < WARNING_THRESHOLD) {
      newThreshold = WARNING_THRESHOLD;
    } else if (charCount >= DANGER_THRESHOLD && previousAnnouncedThreshold < DANGER_THRESHOLD) {
      newThreshold = DANGER_THRESHOLD;
    } else if (charCount > MAX_CHARS && previousAnnouncedThreshold <= MAX_CHARS) {
      newThreshold = MAX_CHARS + 1;
    }

    if (newThreshold !== previousAnnouncedThreshold) {
      setPreviousAnnouncedThreshold(newThreshold);
    }
  }, [charCount, previousAnnouncedThreshold]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canShare) return;

    const messageToSave = trimmedMessage;
    
    try {
      await onShare(messageToSave, imageFile || undefined);
      setMessage('');
      setImageFile(null);
      setImagePreview(null);
      clearDraft();
      setShowPosted(true);
      setInCooldown(true);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        setInCooldown(false);
      }, COOLDOWN_MS);

      setTimeout(() => {
        setShowPosted(false);
      }, 3000);

      onPosted?.();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    saveDraft(newValue);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="panel-2008 p-4 mb-3">
      <form onSubmit={handleSubmit}>
        <label htmlFor="message" className="sr-only">
          What's on your mind?
        </label>
        <textarea
          ref={textareaRef}
          id="message"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="w-full p-2 border border-panel-border rounded-sm resize-none focus:outline-none focus:ring-2 focus:ring-link focus:border-transparent"
          style={{ 
            fontFamily: '"Lucida Grande", Tahoma, Verdana, sans-serif',
            fontSize: '13px',
            minHeight: '60px'
          }}
          rows={2}
          maxLength={MAX_CHARS + 1}
          disabled={isSharing}
        />
        
        {imagePreview && (
          <div className="mt-2 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-auto max-h-48 rounded-sm"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-opacity-70"
              disabled={isSharing}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-link text-xs hover:underline"
              disabled={isSharing}
            >
              📷 Add photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isSharing}
            />
            <span 
              className="text-xs"
              style={{
                color: isOverLimit ? '#d32f2f' : isDanger ? '#f57c00' : isWarning ? '#f57c00' : '#666666',
                fontWeight: isOverLimit || isDanger ? 'bold' : 'normal'
              }}
              aria-live="polite"
              aria-atomic="true"
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
          <button
            type="submit"
            disabled={!canShare}
            className="button-2008 text-white text-sm px-4 py-1.5"
          >
            {isSharing ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending…
              </span>
            ) : inCooldown ? (
              'Wait…'
            ) : (
              'Share'
            )}
          </button>
        </div>
        {showPosted && (
          <div className="mt-2 text-xs text-green-600 font-medium" aria-live="polite">
            Posted!
          </div>
        )}
      </form>
    </div>
  );
}
