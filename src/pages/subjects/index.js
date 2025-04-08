import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Available Subjects</h1>
          <p className="mt-4 text-lg text-gray-600">
            Browse through our comprehensive list of subjects and find the perfect tutor for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/tutors?subject=${subject.name}`}
              className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900">{subject.name}</h3>
              <p className="mt-2 text-gray-600">
                Find expert tutors specializing in {subject.name.toLowerCase()}
              </p>
              <div className="mt-4 text-primary-600 font-medium">
                View Tutors →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 