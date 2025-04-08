import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// Icons
const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    totalHours: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'student') {
      router.push('/tutor/dashboard');
      return;
    }
    setUser({
      ...user,
      fullName: `${user.first_name} ${user.last_name}`.trim()
    });
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const bookingsRes = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!bookingsRes.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookingsData = await bookingsRes.json();

      // Transform booking data
      const transformedBookings = bookingsData.bookings.map(booking => ({
        id: booking.id,
        tutorName: `${booking.tutor_first_name} ${booking.tutor_last_name}`.trim(),
        subject: booking.subject,
        status: booking.status,
        date: new Date(booking.date).toLocaleDateString(),
        time: `${booking.start_time} - ${booking.end_time}`,
        description: booking.description,
        duration: booking.duration || 1 // Default to 1 hour if not specified
      }));

      setBookings(transformedBookings);

      // Calculate stats
      const activeBookings = transformedBookings.filter(b => b.status === 'accepted');
      const pendingBookings = transformedBookings.filter(b => b.status === 'pending');
      const completedBookings = transformedBookings.filter(b => b.status === 'completed');

      setStats({
        upcomingSessions: activeBookings.length,
        completedSessions: completedBookings.length,
        totalHours: completedBookings.reduce((total, booking) => total + booking.duration, 0),
        pendingRequests: pendingBookings.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const StatCard = ({ icon, label, value }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const SessionCard = ({ session }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{session.tutorName}</h3>
          <p className="text-sm text-gray-600">{session.subject}</p>
          {session.description && (
            <p className="mt-2 text-sm text-gray-500">{session.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium
          ${session.status === 'accepted' ? 'bg-green-100 text-green-800' : 
            session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'}`}>
          {session.status}
        </span>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-600">
        <CalendarIcon className="w-4 h-4 mr-2" />
        {session.date}
        <span className="mx-2">•</span>
        <ClockIcon className="w-4 h-4 mr-2" />
        {session.time}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your learning journey
            </p>
          </div>
          <div>
            <Link href="/tutors" passHref>
              <Button>Find a Tutor</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<CalendarIcon />}
            label="Upcoming Sessions"
            value={stats.upcomingSessions}
          />
          <StatCard
            icon={<BookIcon />}
            label="Completed Sessions"
            value={stats.completedSessions}
          />
          <StatCard
            icon={<ClockIcon />}
            label="Total Hours"
            value={`${stats.totalHours}h`}
          />
          <StatCard
            icon={<UserIcon />}
            label="Pending Requests"
            value={stats.pendingRequests}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Sessions</h2>
              <span className="text-sm text-gray-400 cursor-not-allowed" title="Sessions page - Coming soon">
                View all
              </span>
            </div>
            {bookings.filter(b => ['accepted', 'pending'].includes(b.status)).length > 0 ? (
              <div className="space-y-4">
                {bookings
                  .filter(b => ['accepted', 'pending'].includes(b.status))
                  .map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-600">No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 