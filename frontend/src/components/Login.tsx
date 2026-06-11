import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).');
      return;
    }

    let cancelled = false;

    const init = () => {
      if (cancelled || !window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            await loginWithGoogle(response.credential);
          } catch (err: any) {
            setError(err.message || 'Sign in failed');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
      });
    };

    if (window.google) {
      init();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      script?.addEventListener('load', init);
      return () => script?.removeEventListener('load', init);
    }

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle]);

  return (
    <div className="min-h-screen bg-midnight-black flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex items-center gap-2 text-white">
        <BookOpen className="w-7 h-7 text-soft-pink" />
        <span className="text-xl font-semibold">LoreKeeper</span>
      </div>
      <p className="text-purple-300/60 text-sm max-w-sm">
        Sign in with Google to upload your story bible and chat with your own private workspace.
      </p>
      <div ref={buttonRef} />
      {error && <p className="text-rose-400 text-sm max-w-sm">{error}</p>}
    </div>
  );
}
