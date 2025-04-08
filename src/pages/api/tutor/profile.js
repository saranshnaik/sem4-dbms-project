import db from '@/lib/db';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { bio, education, experience, hourlyRate, selectedSubjects } = req.body;

    // Validate required fields
    if (!bio || !education || !experience || !hourlyRate || !selectedSubjects?.length) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create tutor profile
      const [result] = await connection.query(
        `INSERT INTO tutor_profiles (user_id, bio, education, experience_years, hourly_rate)
         VALUES (?, ?, ?, ?, ?)`,
        [decoded.userId, bio, education, experience, hourlyRate]
      );

      // Add selected subjects
      const subjectValues = selectedSubjects.map(subjectId => [decoded.userId, subjectId]);
      await connection.query(
        'INSERT INTO tutor_subjects (tutor_id, subject_id) VALUES ?',
        [subjectValues]
      );

      await connection.commit();
      
      res.status(201).json({
        message: 'Tutor profile created successfully',
        profile: {
          id: result.insertId,
          userId: decoded.userId,
          bio,
          education,
          experience,
          hourlyRate,
          subjects: selectedSubjects
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating tutor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 