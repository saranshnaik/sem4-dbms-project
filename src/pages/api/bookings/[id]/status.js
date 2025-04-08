import db from '@/lib/db';
import { authMiddleware } from '@/utils/auth';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { userId, role } = req.user;
  const { status } = req.body;

  if (!status || !['accepted', 'declined', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Get the booking request
    const [bookings] = await db.query(
      'SELECT * FROM booking_requests WHERE id = ?',
      [id]
    );

    if (!bookings.length) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    const booking = bookings[0];

    // Verify permissions
    if (role === 'tutor' && booking.tutor_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (role === 'student' && booking.student_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Validate status transitions
    if (role === 'student' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Students can only cancel bookings' });
    }

    if (role === 'tutor' && !['accepted', 'declined', 'completed'].includes(status)) {
      return res.status(403).json({ message: 'Invalid status for tutor' });
    }

    // Update booking status
    await db.query(
      'UPDATE booking_requests SET status = ? WHERE id = ?',
      [status, id]
    );

    res.status(200).json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default authMiddleware(handler); 