import { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'History', 'Geography', 'Computer Science',
  'Economics', 'Business Studies', 'Accounting',
  'French', 'Spanish', 'Music', 'Art'
];

export default function TutorProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    education: '',
    yearsOfExperience: '',
    hourlyRate: '',
    selectedSubjects: []
  });

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create tutor profile
      const profileRes = await fetch('/api/tutor/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: formData.bio,
          education: formData.education,
          yearsOfExperience: parseInt(formData.yearsOfExperience),
          hourlyRate: parseFloat(formData.hourlyRate)
        })
      });

      if (!profileRes.ok) {
        throw new Error('Failed to create tutor profile');
      }

      // Add subjects
      const subjectsRes = await fetch('/api/tutor/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjects: formData.selectedSubjects
        })
      });

      if (!subjectsRes.ok) {
        throw new Error('Failed to add subjects');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Tutor Profile</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            required
            rows={4}
            className="input-field"
            placeholder="Tell students about yourself, your teaching style, and experience..."
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          />
        </div>

        {/* Education */}
        <div>
          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
            Education
          </label>
          <input
            type="text"
            id="education"
            required
            className="input-field"
            placeholder="e.g., BSc in Mathematics from XYZ University"
            value={formData.education}
            onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            id="yearsOfExperience"
            required
            min="0"
            max="50"
            className="input-field"
            value={formData.yearsOfExperience}
            onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
          />
        </div>

        {/* Hourly Rate */}
        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            id="hourlyRate"
            required
            min="5"
            step="0.01"
            className="input-field"
            value={formData.hourlyRate}
            onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
          />
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects You Can Teach
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => handleSubjectToggle(subject)}
                className={`p-3 text-sm rounded-lg border-2 transition-colors duration-200
                  ${formData.selectedSubjects.includes(subject)
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-600 hover:bg-primary-50'
                  }`}
              >
                {subject}
              </button>
            ))}
          </div>
          {formData.selectedSubjects.length === 0 && (
            <p className="mt-2 text-sm text-red-600">Please select at least one subject</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || formData.selectedSubjects.length === 0}
          className="mt-8"
          full
        >
          {loading ? 'Creating Profile...' : 'Complete Profile'}
        </Button>
      </form>
    </div>
  );
} 