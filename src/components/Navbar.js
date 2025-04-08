import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Call logout API to invalidate token
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update state
      setIsLoggedIn(false);
      setUser(null);
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      router.push('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
            TutorConnect
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/tutors" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Find Tutors
            </Link>
            <Link 
              href="/subjects" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Subjects
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <span>{user?.username}</span>
                    <img
                      src={user?.avatar_url || '/default-avatar.png'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                    />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <button
            className="md:hidden text-gray-600 hover:text-primary-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/tutors"
              className="block py-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              Find Tutors
            </Link>
            <Link
              href="/subjects"
              className="block py-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              Subjects
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block py-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block py-2 btn-primary w-full text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
