import { useState, useEffect } from 'react';

// Shared timer for relative timestamps - updates every 30 seconds
let now: Date = new Date();
let listeners: Set<() => void> = new Set();
let intervalId: NodeJS.Timeout | null = null;

function startTimer() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    now = new Date();
    listeners.forEach((listener) => listener());
  }, 30000); // Update every 30 seconds
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function useNow() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((prev) => prev + 1);
    listeners.add(listener);
    startTimer();

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        stopTimer();
      }
    };
  }, []);

  return now;
}
