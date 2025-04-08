import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TutorSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    bio: '',
    education: '',
    yearsOfExperience: '',
    hourlyRate: '',
    selectedSubjects: []
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isNewTutor = localStorage.getItem('isNewTutor');
    
    if (!token || !isNewTutor) {
      router.push('/');
      return;
    }

    fetchSubjects();
  }, [router]);

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects. Please try again later.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tutors/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: formData.bio,
          education: formData.education,
          yearsOfExperience: parseInt(formData.yearsOfExperience),
          hourlyRate: parseFloat(formData.hourlyRate),
          subjects: formData.selectedSubjects
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tutor profile');
      }

      // Clear the new tutor flag
      localStorage.removeItem('isNewTutor');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating tutor profile:', error);
      setError(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Tutor Profile</h1>
            <p className="mt-2 text-gray-600">
              Tell us more about yourself to help students find you
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                required
                rows={4}
                className="input-field"
                placeholder="Tell students about your teaching experience and style..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                Education
              </label>
              <textarea
                id="education"
                required
                rows={2}
                className="input-field"
                placeholder="List your relevant educational qualifications..."
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="yearsOfExperience"
                  required
                  min="0"
                  className="input-field"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  required
                  min="0"
                  step="50"
                  className="input-field"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects You Can Teach
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subjects.map(subject => (
                  <label
                    key={subject.id}
                    className={`
                      flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${formData.selectedSubjects.includes(subject.id)
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-600 hover:bg-primary-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.selectedSubjects.includes(subject.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          selectedSubjects: isChecked
                            ? [...prev.selectedSubjects, subject.id]
                            : prev.selectedSubjects.filter(id => id !== subject.id)
                        }));
                      }}
                    />
                    <span className="text-sm">{subject.name}</span>
                  </label>
                ))}
              </div>
              {formData.selectedSubjects.length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  Please select at least one subject
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || formData.selectedSubjects.length === 0}
              className="w-full btn-primary"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="spinner spinner-light w-5 h-5 mr-3"></div>
                  Creating profile...
                </div>
              ) : (
                'Complete Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 