import db from '@/lib/db';
import { authMiddleware } from '@/utils/auth';
import { verifyToken } from '@/utils/auth';

async function handler(req, res) {
  const { method } = req;
  const { userId, role } = req.user;

  if (role !== 'tutor') {
    return res.status(403).json({ message: 'Only tutors can access this endpoint' });
  }

  switch (method) {
    case 'GET':
      try {
        const [profiles] = await db.query(`
          SELECT tp.*, u.username, u.email, u.first_name, u.last_name, u.avatar_url,
          GROUP_CONCAT(s.name) as subjects
          FROM tutor_profiles tp
          JOIN users u ON tp.user_id = u.id
          LEFT JOIN tutor_subjects ts ON tp.id = ts.tutor_profile_id
          LEFT JOIN subjects s ON ts.subject_id = s.id
          WHERE tp.user_id = ?
          GROUP BY tp.id
        `, [userId]);

        if (!profiles.length) {
          return res.status(404).json({ message: 'Tutor profile not found' });
        }

        const profile = profiles[0];
        profile.subjects = profile.subjects ? profile.subjects.split(',') : [];

        res.status(200).json(profile);
      } catch (error) {
        console.error('Error fetching tutor profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'PUT':
      try {
        const { bio, hourly_rate, years_of_experience, education, subjects } = req.body;

        // Update tutor profile
        await db.query(`
          UPDATE tutor_profiles 
          SET bio = ?, hourly_rate = ?, years_of_experience = ?, education = ?
          WHERE user_id = ?
        `, [bio, hourly_rate, years_of_experience, education, userId]);

        // If subjects are provided, update them
        if (subjects && Array.isArray(subjects)) {
          // First, get the tutor profile ID
          const [profiles] = await db.query(
            'SELECT id FROM tutor_profiles WHERE user_id = ?',
            [userId]
          );
          
          if (profiles.length) {
            const profileId = profiles[0].id;
            
            // Delete existing subject associations
            await db.query(
              'DELETE FROM tutor_subjects WHERE tutor_profile_id = ?',
              [profileId]
            );

            // Add new subject associations
            for (const subjectId of subjects) {
              await db.query(
                'INSERT INTO tutor_subjects (tutor_profile_id, subject_id) VALUES (?, ?)',
                [profileId, subjectId]
              );
            }
          }
        }

        res.status(200).json({ message: 'Profile updated successfully' });
      } catch (error) {
        console.error('Error updating tutor profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'POST':
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

        // Verify user is a pending tutor
        if (role !== 'tutor' && role !== 'pending_tutor') {
          return res.status(403).json({ error: 'Only tutors can create profiles' });
        }

        const { bio, education, yearsOfExperience, hourlyRate, subjects } = req.body;

        // Validate required fields
        if (!bio || !hourlyRate || !subjects || subjects.length === 0) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Start a transaction
        const connection = await db.pool.getConnection();
        await connection.beginTransaction();

        try {
          // Create tutor profile
          const [profileResult] = await connection.query(
            `INSERT INTO tutor_profiles 
             (user_id, bio, education, years_of_experience, hourly_rate)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, bio, education || null, yearsOfExperience || null, hourlyRate]
          );

          const profileId = profileResult.insertId;

          // Add subject associations
          const subjectValues = subjects.map(subjectId => [profileId, subjectId]);
          await connection.query(
            'INSERT INTO tutor_subjects (tutor_profile_id, subject_id) VALUES ?',
            [subjectValues]
          );

          // Update user role from pending_tutor to tutor
          await connection.query(
            'UPDATE users SET role = ? WHERE id = ? AND role = ?',
            ['tutor', userId, 'pending_tutor']
          );

          // Commit transaction
          await connection.commit();

          return res.status(201).json({
            message: 'Tutor profile created successfully',
            profile_id: profileId
          });
        } catch (error) {
          // Rollback on error
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error creating tutor profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST']);
      res.status(405).json({ message: `Method ${method} not allowed` });
  }
}

export default authMiddleware(handler); 