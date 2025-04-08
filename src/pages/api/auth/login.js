import db from "@/lib/db";
import bcrypt from "bcrypt";
import { generateToken } from "@/config/jwt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?", 
      [email]
    );
    
    if (!users || users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Don't send the password in the response
    delete user.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle specific database errors
    if (error.code === 'ER_CON_COUNT_ERROR') {
      return res.status(503).json({ 
        message: "Service temporarily unavailable. Please try again in a moment." 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: "Unable to connect to database. Please try again later." 
      });
    }

    res.status(500).json({ 
      message: "An unexpected error occurred. Please try again later." 
    });
  }
}
