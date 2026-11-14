// Generate a consistent color from a string (for avatars)
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 2008-style palette - muted, web 2.0 colors
  const colors = [
    '#6b8cce', // blue
    '#7c9473', // green
    '#c47f5e', // orange
    '#8b6b8c', // purple
    '#5c8a8a', // teal
    '#a67c52', // brown
    '#7a7a7a', // gray
    '#9e7a7a', // rose
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

// Format relative time
export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Get full date string for title attribute
export function getFullDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get profile image URL for an author from Supabase
export async function getProfileImage(author: string): Promise<string | null> {
  try {
    const { supabase } = await import('@/lib/supabase');
    const fileName = `${author.toLowerCase()}.jpg`;
    const { data } = await supabase
      .storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    if (data?.publicUrl) {
      // Check if file exists by making a HEAD request
      const response = await fetch(data.publicUrl, { method: 'HEAD', cache: 'no-store' });
      if (response.ok) {
        // Add timestamp to prevent caching
        return `${data.publicUrl}?t=${Date.now()}`;
      }
    }
    return null;
  } catch (e) {
    console.error('Failed to get profile image:', e);
    return null;
  }
}
