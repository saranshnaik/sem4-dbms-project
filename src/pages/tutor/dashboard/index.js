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

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function TutorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'confirmed'
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    totalEarnings: 0,
    totalStudents: 0,
    totalHours: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'tutor') {
      router.push('/dashboard');
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
      
      // Transform booking data to match the expected format
      const transformedBookings = bookingsData.bookings.map(booking => ({
        id: booking.id,
        studentName: `${booking.student_first_name} ${booking.student_last_name}`.trim(),
        subject: booking.subject,
        status: booking.status,
        date: booking.date,
        time: `${booking.start_time} - ${booking.end_time}`,
        description: booking.description,
        duration: booking.duration || 1, // Default to 1 hour if not specified
        hourlyRate: booking.hourly_rate || 0
      }));

      setBookings(transformedBookings);

      // Calculate stats
      const activeBookings = transformedBookings.filter(b => b.status === 'accepted');
      const completedBookings = transformedBookings.filter(b => b.status === 'completed');
      const uniqueStudents = new Set([
        ...activeBookings.map(b => b.studentName),
        ...completedBookings.map(b => b.studentName)
      ]);

      setStats({
        upcomingSessions: activeBookings.length,
        totalEarnings: completedBookings.reduce((total, booking) => 
          total + (booking.duration * booking.hourlyRate), 0),
        totalStudents: uniqueStudents.size,
        totalHours: completedBookings.reduce((total, booking) => total + booking.duration, 0)
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} booking`);
      }

      // Refresh bookings after action
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
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

  const BookingCard = ({ booking }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{booking.studentName}</h3>
          <p className="text-sm text-gray-600">{booking.subject}</p>
          {booking.description && (
            <p className="mt-2 text-sm text-gray-500">{booking.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium
          ${booking.status === 'accepted' ? 'bg-green-100 text-green-800' : 
            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'}`}>
          {booking.status}
        </span>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-600">
        <CalendarIcon className="w-4 h-4 mr-2" />
        {new Date(booking.date).toLocaleDateString()}
        <span className="mx-2">•</span>
        <span>{booking.time}</span>
      </div>
      {booking.status === 'pending' && (
        <div className="mt-4 flex space-x-3">
          <Button 
            size="sm" 
            variant="success"
            onClick={() => handleBookingAction(booking.id, 'accept')}
            className="flex items-center space-x-1"
          >
            <CheckIcon />
            <span>Accept</span>
          </Button>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => handleBookingAction(booking.id, 'decline')}
            className="flex items-center space-x-1"
          >
            <XIcon />
            <span>Decline</span>
          </Button>
        </div>
      )}
    </div>
  );

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's an overview of your teaching activity
            </p>
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
            icon={<MoneyIcon />}
            label="Total Earnings"
            value={`$${stats.totalEarnings}`}
          />
          <StatCard
            icon={<UserGroupIcon />}
            label="Total Students"
            value={stats.totalStudents}
          />
          <StatCard
            icon={<ClockIcon />}
            label="Hours Taught"
            value={`${stats.totalHours}h`}
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Requests ({pendingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('accepted')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'accepted'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming Sessions ({acceptedBookings.length})
              </button>
            </nav>
          </div>

          {/* Booking Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTab === 'pending' ? (
              pendingBookings.length > 0 ? (
                pendingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-100">
                  <p className="text-gray-600">No pending booking requests</p>
                </div>
              )
            ) : (
              acceptedBookings.length > 0 ? (
                acceptedBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-100">
                  <p className="text-gray-600">No upcoming sessions</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 