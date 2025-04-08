import db from "@/lib/db";
import bcrypt from "bcrypt";
import { generateToken } from "@/config/jwt";
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!['PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { userId, role } = decoded;

    // Get the booking request
    const [bookings] = await db.query(
      'SELECT * FROM booking_requests WHERE id = ?',
      [id]
    );

    if (!bookings.length) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    const booking = bookings[0];

    // Verify user has permission to modify this booking
    if (role === 'tutor' && booking.tutor_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this booking' });
    }
    if (role === 'student' && booking.student_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this booking' });
    }

    if (req.method === 'PUT') {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      // Validate status enum
      const validStatuses = ['pending', 'accepted', 'declined', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Validate status transitions
      if (role === 'student') {
        // Students can only cancel their pending or accepted bookings
        if (status !== 'cancelled' || !['pending', 'accepted'].includes(booking.status)) {
          return res.status(403).json({ error: 'Invalid status transition for student' });
        }
      } else if (role === 'tutor') {
        // Tutors can accept/decline pending bookings, or mark accepted bookings as completed
        if (
          (booking.status === 'pending' && !['accepted', 'declined'].includes(status)) ||
          (booking.status === 'accepted' && status !== 'completed') ||
          (booking.status !== 'pending' && booking.status !== 'accepted')
        ) {
          return res.status(403).json({ error: 'Invalid status transition for tutor' });
        }
      }

      // Update booking status
      await db.query(
        'UPDATE booking_requests SET status = ? WHERE id = ?',
        [status, id]
      );

      return res.status(200).json({ message: 'Booking status updated successfully' });

    } else if (req.method === 'DELETE') {
      // Only allow deletion of pending requests
      if (booking.status !== 'pending') {
        return res.status(400).json({ error: 'Can only delete pending booking requests' });
      }

      // Delete the booking request
      await db.query('DELETE FROM booking_requests WHERE id = ?', [id]);

      return res.status(200).json({ message: 'Booking request deleted successfully' });
    }
  } catch (error) {
    console.error('Error handling booking request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
