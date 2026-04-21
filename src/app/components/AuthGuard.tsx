import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AUTH_PORTAL_URL = import.meta.env.VITE_AUTH_PORTAL_URL || "https://auth.mantracare.com";
const REDIRECT_KEY = 'APP_REDIRECT_PATH';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');

  // 1. Intercept Unauthenticated Deep Links & Handle Auth Portal Return
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // 2. Handle Auth Portal Return & Magic Links
      // Exchange token for userId
      const exchangeToken = async () => {
        try {
          // TODO: Replace with real API call
          // const res = await fetch(`${AUTH_PORTAL_URL}/api/verify`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ token })
          // });
          // const { userId: resolvedId } = await res.json();
          
          const resolvedId = "user_" + Math.random().toString(36).substr(2, 9); 
          localStorage.setItem('userId', resolvedId);
          
          // 3. The "Smart" Restore & Navigate
          restoreAndNavigate();
        } catch (error) {
          console.error("Auth failed:", error);
          redirectToAuthPortal();
        }
      };
      
      exchangeToken();
    } else if (!userId) {
      // 1. Intercept Unauthenticated Deep Links
      redirectToAuthPortal();
    }
  }, []);

  // 4. Stale Token Cleanup (Failsafe)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (userId && params.has('token')) {
      params.delete('token');
      const cleanSearch = params.toString();
      navigate(
        location.pathname + (cleanSearch ? `?${cleanSearch}` : ''),
        { replace: true }
      );
    }
  }, [location.search, userId, navigate, location.pathname]);

  const redirectToAuthPortal = () => {
    const intendedPath = location.pathname + location.search;
    if (intendedPath && intendedPath !== '/') {
      localStorage.setItem(REDIRECT_KEY, intendedPath);
    }
    
    // Pass application's root URL as redirect_url
    const returnUrl = window.location.origin + (import.meta.env.BASE_URL || "/");
    window.location.href = `${AUTH_PORTAL_URL}?redirect_url=${encodeURIComponent(returnUrl)}`;
  };

  const restoreAndNavigate = () => {
    const savedPath = localStorage.getItem(REDIRECT_KEY);
    localStorage.removeItem(REDIRECT_KEY);
    
    // Fallback Logic: Saved path -> currentPathname -> Home
    // location.pathname natively excludes the token from the URL query string
    const target = savedPath || location.pathname || '/';
    
    navigate(target, { replace: true });
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
