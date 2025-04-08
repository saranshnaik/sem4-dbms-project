import '@/styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';

// Routes that don't need the navbar
const noNavbarRoutes = ['/auth/login', '/auth/register'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication on initial load and route changes
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setAuthenticated(!!token);
      setLoading(false);
    };

    checkAuth();
    router.events.on('routeChangeComplete', checkAuth);

    return () => {
      router.events.off('routeChangeComplete', checkAuth);
    };
  }, [router]);

  // Add loading state for route changes
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Protected route handling
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/tutor', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route => 
      router.pathname.startsWith(route)
    );

    if (!loading && isProtectedRoute && !authenticated) {
      router.push('/auth/login');
    }
  }, [router, loading, authenticated]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="spinner" />
      </div>
    );
  }

  // Determine if navbar should be shown
  const hideNavbar = noNavbarRoutes.includes(router.pathname);

  return (
    <Layout hideNavbar={hideNavbar}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
