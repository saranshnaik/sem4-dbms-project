import db from '../../../lib/db';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch subjects and count of tutors for each subject
    const [subjects] = await db.query(`
      SELECT s.id, s.name, COUNT(DISTINCT ts.tutor_profile_id) as tutorCount
      FROM subjects s
      LEFT JOIN tutor_subjects ts ON s.id = ts.subject_id
      GROUP BY s.id, s.name
      ORDER BY s.name ASC
    `);

    return res.status(200).json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler; 