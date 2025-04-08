import db from '../../../lib/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', ['GET', 'POST']);
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

    if (req.method === 'GET') {
      let query;
      let queryParams = [];

      // Get current date at start of day for filtering
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const currentDate = now.toISOString().slice(0, 19).replace('T', ' ');

      if (role === 'student') {
        query = `
          SELECT 
            br.*,
            u.first_name as tutor_first_name,
            u.last_name as tutor_last_name,
            u.avatar_url as tutor_avatar,
            tp.hourly_rate
          FROM booking_requests br
          JOIN users u ON br.tutor_id = u.id
          JOIN tutor_profiles tp ON br.tutor_id = tp.user_id
          WHERE br.student_id = ?
          AND (br.status IN ('pending', 'accepted') OR 
               (br.status = 'completed' AND br.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)))
          ORDER BY 
            CASE 
              WHEN br.status = 'pending' THEN 1
              WHEN br.status = 'accepted' AND br.date >= ? THEN 2
              ELSE 3
            END,
            br.date ASC
        `;
        queryParams = [userId, currentDate];
      } else if (role === 'tutor') {
        query = `
          SELECT 
            br.*,
            u.first_name as student_first_name,
            u.last_name as student_last_name,
            u.avatar_url as student_avatar
          FROM booking_requests br
          JOIN users u ON br.student_id = u.id
          WHERE br.tutor_id = ?
          AND (br.status IN ('pending', 'accepted') OR 
               (br.status = 'completed' AND br.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)))
          ORDER BY 
            CASE 
              WHEN br.status = 'pending' THEN 1
              WHEN br.status = 'accepted' AND br.date >= ? THEN 2
              ELSE 3
            END,
            br.date ASC
        `;
        queryParams = [userId, currentDate];
      } else {
        return res.status(403).json({ error: 'Invalid user role' });
      }

      const [bookings] = await db.query(query, queryParams);

      // Format dates and times for frontend
      const formattedBookings = bookings.map(booking => ({
        ...booking,
        date: booking.date.toISOString().split('T')[0],
        start_time: booking.start_time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        end_time: booking.end_time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        created_at: booking.created_at.toISOString()
      }));

      return res.status(200).json({ bookings: formattedBookings });

    } else if (req.method === 'POST') {
      if (role !== 'student') {
        return res.status(403).json({ error: 'Only students can create booking requests' });
      }

      const { tutor_id, subject, description, date, start_time, end_time } = req.body;

      if (!tutor_id || !subject || !date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate that tutor exists and is actually a tutor
      const [tutors] = await db.query(
        'SELECT u.id FROM users u JOIN tutor_profiles tp ON u.id = tp.user_id WHERE u.id = ? AND u.role = ?',
        [tutor_id, 'tutor']
      );

      if (!tutors.length) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      // Parse and validate the date and times
      try {
        // Ensure the date is in YYYY-MM-DD format
        const mysqlDate = new Date(date).toISOString().slice(0, 10);

        // Validate time format
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
          return res.status(400).json({ error: 'Invalid time format. Please use HH:mm format (24-hour).' });
        }

        // Create MySQL datetime strings
        const mysqlStartTime = `${mysqlDate} ${start_time}:00`;
        const mysqlEndTime = `${mysqlDate} ${end_time}:00`;

        const [result] = await db.query(`
          INSERT INTO booking_requests 
          (student_id, tutor_id, subject, description, date, start_time, end_time, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [
          userId,
          tutor_id,
          subject,
          description || null,
          `${mysqlDate} 00:00:00`,
          mysqlStartTime,
          mysqlEndTime
        ]);

        return res.status(201).json({
          message: 'Booking request created successfully',
          booking_id: result.insertId
        });
      } catch (error) {
        console.error('Date parsing error:', error);
        return res.status(400).json({ error: 'Invalid date or time format' });
      }
    }
  } catch (error) {
    console.error('Error handling booking request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 