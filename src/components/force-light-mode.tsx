'use client';

import { useEffect } from 'react';

export function ForceLightMode() {
  useEffect(() => {
    // Remove dark mode class to force light mode for templates
    document.documentElement.classList.remove('dark');
    
    // Cleanup: restore dark mode when navigating back to dashboard
    return () => {
      document.documentElement.classList.add('dark');
    };
  }, []);
  
  return null;
}
