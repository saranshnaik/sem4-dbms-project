import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function TutorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    priceRange: 'all',
    sortBy: 'rating'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchSubjects();
  }, [router]);

  useEffect(() => {
    if (subjects.length > 0) {
      fetchTutors();
    }
  }, [filters, subjects]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      setSubjects(data.subjects || []);
      
      // Set initial subject filter from URL if present
      const { subject } = router.query;
      if (subject) {
        setFilters(prev => ({ ...prev, subject }));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects. Please try again later.');
    }
  };

  const fetchTutors = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        subject: filters.subject,
        priceRange: filters.priceRange,
        sortBy: filters.sortBy
      }).toString();

      const response = await fetch(`/api/tutors?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }

      const data = await response.json();
      setTutors(data.tutors || []);
      setError('');
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setError('Failed to load tutors. Please try again later.');
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  const TutorCard = ({ tutor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start space-x-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100">
          {tutor.avatar_url ? (
            <img
              src={tutor.avatar_url}
              alt={`${tutor.first_name} ${tutor.last_name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-xl font-semibold">
              {tutor.first_name[0]}
              {tutor.last_name[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            {tutor.first_name} {tutor.last_name}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {tutor.subjects?.join(', ') || 'No subjects listed'}
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="flex items-center text-yellow-400">
              {'★'.repeat(Math.round(tutor.rating || 0))}
              {'☆'.repeat(5 - Math.round(tutor.rating || 0))}
            </span>
            <span className="ml-2">{(tutor.rating || 0).toFixed(1)} ({tutor.reviewCount || 0} reviews)</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">₹{tutor.hourly_rate}/hr</p>
          <Link
            href={`/tutors/${tutor.id}`}
            className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View Profile
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find a Tutor</h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse our qualified tutors and find the perfect match for your learning needs
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                className="input-field w-full"
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.tutorCount} {subject.tutorCount === 1 ? 'tutor' : 'tutors'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                className="input-field w-full"
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              >
                <option value="all">All Prices</option>
                <option value="0-500">Under ₹500/hr</option>
                <option value="500-1000">₹500 - ₹1000/hr</option>
                <option value="1000+">Above ₹1000/hr</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="input-field w-full"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                <option value="rating">Rating</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tutors List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : tutors.length > 0 ? (
          <div className="space-y-6">
            {tutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tutors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters to find more tutors
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 