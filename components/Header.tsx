'use client';

import { useState, useEffect } from 'react';

const AUTHOR_NAME_KEY = 'mywall_author_name';
const DEFAULT_AUTHOR = 'Jinwoo';

export default function Header() {
  const [authorName, setAuthorName] = useState(DEFAULT_AUTHOR);

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

  return (
    <header 
      className="w-full sticky top-0 z-40"
      style={{
        background: 'linear-gradient(to bottom, #5c8bc7, #3b5998)',
        borderBottom: '1px solid #29487e'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 
          className="text-white text-xl font-normal tracking-tight"
          style={{ fontFamily: '"Lucida Grande", Tahoma, Verdana, sans-serif' }}
        >
          MY WALL
        </h1>
        <div 
          className="text-xs text-white"
          style={{ fontFamily: '"Lucida Grande", Tahoma, Verdana, sans-serif' }}
        >
          posting as <span className="font-bold">{authorName}</span>
        </div>
      </div>
    </header>
  );
}
