import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const AuthInitializer = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize().catch(console.error);
  }, [initialize]);

  return null; // This component doesn't render anything
}; 