import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function TutorProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    subject: '',
    description: '',
    date: '',
    start_time: '',
    end_time: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    setCurrentUser(JSON.parse(userData));
    if (id) {
      fetchTutorDetails();
    }
  }, [id, router]);

  const fetchTutorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tutors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tutor details');
      }

      const data = await response.json();
      setTutor(data.tutor);
    } catch (error) {
      console.error('Error fetching tutor:', error);
      setError('Failed to load tutor details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setSubmitting(true);

    try {
      // Get today's date for validation
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Create date object from form inputs
      const selectedDate = new Date(bookingForm.date);
      selectedDate.setHours(0, 0, 0, 0);

      // Validate date is not in the past
      if (selectedDate < today) {
        throw new Error('Please select a future date');
      }

      // Validate time format
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(bookingForm.start_time) || !timeRegex.test(bookingForm.end_time)) {
        throw new Error('Please enter valid times in 24-hour format (HH:mm)');
      }

      // Parse times for validation
      const [startHours, startMinutes] = bookingForm.start_time.split(':').map(Number);
      const [endHours, endMinutes] = bookingForm.end_time.split(':').map(Number);

      // Validate time range
      if (endHours < startHours || (endHours === startHours && endMinutes <= startMinutes)) {
        throw new Error('End time must be after start time');
      }

      // Validate business hours (9 AM to 9 PM)
      if (startHours < 9 || endHours > 21) {
        throw new Error('Please select a time between 9 AM and 9 PM');
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tutor_id: id,
          subject: bookingForm.subject.trim(),
          description: bookingForm.description.trim(),
          date: bookingForm.date,
          start_time: bookingForm.start_time,
          end_time: bookingForm.end_time
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setBookingSuccess('Booking request sent successfully!');
      setBookingForm({
        subject: '',
        description: '',
        date: '',
        start_time: '',
        end_time: ''
      });

      // Redirect to student dashboard after successful booking
      router.push('/student/dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600">{error || 'Tutor not found'}</p>
              <Link href="/tutors" className="mt-4 text-primary-600 hover:text-primary-700">
                ← Back to tutors
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/tutors" className="text-primary-600 hover:text-primary-700">
            ← Back to tutors
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tutor Profile Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                {tutor.avatar_url ? (
                  <img
                    src={tutor.avatar_url}
                    alt={`${tutor.first_name} ${tutor.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-3xl font-semibold">
                    {tutor.first_name[0]}
                    {tutor.last_name[0]}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tutor.first_name} {tutor.last_name}
                </h1>
                <p className="mt-1 text-lg text-gray-600">₹{tutor.hourly_rate}/hr</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tutor.subjects?.map(subject => (
                    <span
                      key={subject}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
            {/* Left Column - Tutor Info */}
            <div className="col-span-2 p-8">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-gray-600">{tutor.bio}</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">Education</h2>
                <p className="text-gray-600">{tutor.education}</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">Experience</h2>
                <p className="text-gray-600">
                  {tutor.years_of_experience} {tutor.years_of_experience === 1 ? 'year' : 'years'} of teaching experience
                </p>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            {currentUser && currentUser.role === 'student' && (
              <div className="p-8">
                <h2 className="text-xl font-semibold mb-6">Book a Session</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="input-field"
                      value={bookingForm.subject}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a subject</option>
                      {tutor.subjects?.map(subject => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field"
                      value={bookingForm.date}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                        Start Time (24-hour format)
                      </label>
                      <input
                        type="time"
                        id="start_time"
                        name="start_time"
                        value={bookingForm.start_time}
                        onChange={handleInputChange}
                        required
                        step="300"
                        className="input-field"
                      />
                      <small className="text-gray-500">Format: HH:mm (e.g., 14:30)</small>
                    </div>

                    <div>
                      <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                        End Time (24-hour format)
                      </label>
                      <input
                        type="time"
                        id="end_time"
                        name="end_time"
                        value={bookingForm.end_time}
                        onChange={handleInputChange}
                        required
                        step="300"
                        className="input-field"
                      />
                      <small className="text-gray-500">Format: HH:mm (e.g., 15:30)</small>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="input-field"
                      placeholder="Describe what you'd like to learn..."
                      value={bookingForm.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  {bookingError && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                      {bookingError}
                    </div>
                  )}

                  {bookingSuccess && (
                    <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                      {bookingSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner spinner-light w-5 h-5 mr-3"></div>
                        Sending request...
                      </div>
                    ) : (
                      'Book Session'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 