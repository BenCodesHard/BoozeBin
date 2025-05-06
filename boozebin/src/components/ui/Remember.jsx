'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../supabaseClient';

export default function Remember({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Check for saved session on component mount
    const checkSavedSession = async () => {
      try {
        // Check localStorage for remember me preference
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        
        if (rememberMe) {
          // Attempt to get the saved session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error) {
            // If we have a valid session, redirect to home
            router.push('/');
          } else {
            // If no valid session, clear the remember me flag
            localStorage.removeItem('rememberMe');
          }
        }
      } catch (err) {
        console.error('Error checking saved session:', err);
        localStorage.removeItem('rememberMe');
      }
    };

    checkSavedSession();
  }, [router]);

  return children;
}