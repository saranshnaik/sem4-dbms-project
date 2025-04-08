import db from '../../../../lib/db';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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
    const { id, action } = req.query;

    // Verify user is a tutor
    if (role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can accept/decline bookings' });
    }

    // Verify action is valid
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Verify booking exists and belongs to this tutor
    const [bookings] = await db.query(
      'SELECT * FROM booking_requests WHERE id = ? AND tutor_id = ?',
      [id, userId]
    );

    if (!bookings.length) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    const booking = bookings[0];

    // Verify booking is in pending state
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Can only accept/decline pending bookings' });
    }

    // Update booking status - use 'accepted' instead of 'confirmed'
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    await db.query(
      'UPDATE booking_requests SET status = ? WHERE id = ?',
      [newStatus, id]
    );

    return res.status(200).json({
      message: `Booking ${action}ed successfully`,
      booking: {
        ...booking,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Error handling booking action:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 