import db from '../../../../lib/db';
import { authMiddleware } from '../../../../utils/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // First fetch tutor details without subjects
    const [tutors] = await db.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        tp.bio,
        tp.education,
        tp.years_of_experience,
        tp.hourly_rate,
        tp.id as profile_id
      FROM users u
      INNER JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.id = ? AND u.role = 'tutor'
    `, [id]);

    if (!tutors || tutors.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const tutor = tutors[0];

    // Then fetch subjects in a separate query using the profile_id
    const [subjects] = await db.query(`
      SELECT s.name
      FROM subjects s
      JOIN tutor_subjects ts ON s.id = ts.subject_id
      WHERE ts.tutor_profile_id = ?
    `, [tutor.profile_id]);

    // Add subjects to tutor object
    tutor.subjects = subjects.map(s => s.name);
    
    // Remove sensitive information
    delete tutor.email;
    delete tutor.profile_id;

    return res.status(200).json({ tutor });
  } catch (error) {
    console.error('Error fetching tutor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler); 