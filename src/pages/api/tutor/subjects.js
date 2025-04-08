import { verifyToken } from '@/utils/auth';
import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify token and get user ID
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { subjects } = req.body;

    // Validate subjects
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'At least one subject is required' });
    }

    // Get tutor profile ID
    const [tutorProfile] = await db.query(
      'SELECT id FROM tutor_profiles WHERE user_id = ?',
      [decoded.userId]
    );

    if (tutorProfile.length === 0) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const tutorId = tutorProfile[0].id;

    // Insert subjects
    const values = subjects.map(subject => [tutorId, subject]);
    await db.query(
      'INSERT INTO tutor_subjects (tutor_id, subject_name) VALUES ?',
      [values]
    );

    res.status(201).json({ message: 'Subjects added successfully' });
  } catch (error) {
    console.error('Error adding tutor subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 