import db from "@/lib/db";
import bcrypt from "bcrypt";
import { generateToken } from "@/config/jwt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { firstName, lastName, email, password, role, graduationYear } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if user already exists
    const [existingUser] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const [result] = await db.query(
      "INSERT INTO Users (firstName, lastName, email, password, role, graduationYear, isApproved) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword, role, graduationYear || null, false]
    );

    // Generate token
    const token = generateToken({ userId: result.insertId, email, role });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { userId: result.insertId, firstName, lastName, email, role, graduationYear },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
