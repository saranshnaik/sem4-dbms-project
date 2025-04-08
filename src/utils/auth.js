import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

export function authMiddleware(handler) {
  return async (req, res) => {
    try {
      // Check for token in Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Extract and verify token
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Add user data to request object
      req.user = decoded;

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Helper function to check if user has required role
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
} 