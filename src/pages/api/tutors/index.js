import db from '../../../lib/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    // Get query parameters
    const { subject, priceRange, sortBy } = req.query;

    // Build the base query
    let query = `
      SELECT 
        u.id,
        tp.bio,
        tp.hourly_rate,
        tp.years_of_experience,
        tp.education,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        GROUP_CONCAT(DISTINCT s.name ORDER BY s.name ASC) as subjects
      FROM users u
      INNER JOIN tutor_profiles tp ON u.id = tp.user_id
      LEFT JOIN tutor_subjects ts ON tp.id = ts.tutor_profile_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      WHERE u.role = 'tutor'
    `;

    const queryParams = [];

    // Add subject filter
    if (subject) {
      query += ' AND ts.subject_id = ?';
      queryParams.push(subject);
    }

    // Add price range filter
    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-');
      if (max) {
        query += ' AND tp.hourly_rate BETWEEN ? AND ?';
        queryParams.push(parseFloat(min), parseFloat(max));
      } else {
        query += ' AND tp.hourly_rate >= ?';
        queryParams.push(parseFloat(min));
      }
    }

    // Add group by for all non-aggregated columns
    query += `
      GROUP BY 
        u.id,
        tp.bio,
        tp.hourly_rate,
        tp.years_of_experience,
        tp.education,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url
    `;

    // Add sorting
    switch (sortBy) {
      case 'price_low':
        query += ' ORDER BY tp.hourly_rate ASC';
        break;
      case 'price_high':
        query += ' ORDER BY tp.hourly_rate DESC';
        break;
      case 'experience':
        query += ' ORDER BY tp.years_of_experience DESC NULLS LAST';
        break;
      default:
        query += ' ORDER BY tp.hourly_rate ASC';
    }

    // Execute query
    const [tutors] = await db.query(query, queryParams);

    // Process the results
    const processedTutors = tutors.map(tutor => ({
      ...tutor,
      subjects: tutor.subjects ? tutor.subjects.split(',') : []
    }));

    return res.status(200).json({ tutors: processedTutors });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 