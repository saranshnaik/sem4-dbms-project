import bcrypt from 'bcrypt';
import db from '../../../lib/db';
import { generateToken } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Registration request received:', { ...req.body, password: '[REDACTED]' });
    
    const { username, email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName || !role) {
      console.log('Missing required fields:', {
        hasUsername: !!username,
        hasEmail: !!email,
        hasPassword: !!password,
        hasFirstName: !!firstName,
        hasLastName: !!lastName,
        hasRole: !!role
      });
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    if (!['student', 'tutor'].includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({ error: 'Invalid role. Must be either "student" or "tutor"' });
    }

    // Check if email or username already exists
    console.log('Checking for existing user...');
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      const field = existingUser[0].email === email ? 'Email' : 'Username';
      console.log('User already exists:', field);
      return res.status(400).json({ error: `${field} already registered` });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with the role directly since we can only use 'student' or 'tutor'
    console.log('Creating user...');
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName, lastName, role]
    );

    const userId = result.insertId;
    console.log('User created successfully with ID:', userId);

    // Generate token
    console.log('Generating token...');
    const token = generateToken({ userId, role });

    // Return appropriate response based on role
    const response = {
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        role
      },
      redirectTo: role === 'tutor' ? '/tutor/setup' : '/student/dashboard'
    };
    console.log('Registration successful, sending response');
    return res.status(201).json(response);
  } catch (error) {
    console.error('Error registering user:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
