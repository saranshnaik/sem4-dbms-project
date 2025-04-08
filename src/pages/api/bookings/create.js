export default function handler(req, res) {
  // Redirect to the main bookings endpoint
  res.setHeader('Location', '/api/bookings');
  res.status(308).end(); // 308 Permanent Redirect
} 