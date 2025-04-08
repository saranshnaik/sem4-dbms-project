import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
  }

  try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // If registering as tutor, set flag for profile setup
      if (formData.role === 'tutor') {
        localStorage.setItem('isNewTutor', 'true');
      }

      // Redirect based on response
      router.push(data.redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Join TutorConnect</h2>
        <p className="mt-2 text-sm text-gray-600">
          Create an account to start your learning journey
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              required
              className="input-field mt-1"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              required
              className="input-field mt-1"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            className="input-field mt-1"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="input-field mt-1"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field mt-1"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="input-field mt-1"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`p-4 text-center rounded-lg border-2 transition-all duration-200
                ${formData.role === 'student'
                  ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 hover:border-primary-600 hover:bg-primary-50'
                }`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
            >
              <span className="text-lg font-medium">Learn</span>
              <span className="block text-sm text-gray-500 mt-1">Register as a student</span>
            </button>
            <button
              type="button"
              className={`p-4 text-center rounded-lg border-2 transition-all duration-200
                ${formData.role === 'tutor'
                  ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 hover:border-primary-600 hover:bg-primary-50'
                }`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'tutor' }))}
            >
              <span className="text-lg font-medium">Teach</span>
              <span className="block text-sm text-gray-500 mt-1">Register as a tutor</span>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-8"
          full
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="space-y-2 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in here
            </Link>
          </p>
          <p className="text-gray-600">
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              Return to homepage
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
