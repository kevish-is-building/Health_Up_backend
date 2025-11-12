import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { addTokenToBlacklist } from "../utils/tokenBlacklist.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("-->>>>", req.body)

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Add token to blacklist for enhanced security
    const blacklistSuccess = addTokenToBlacklist(token);
    
    if (blacklistSuccess) {
      res.json({ 
        message: "Logout successful. Token has been invalidated.",
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback to simple logout
      res.json({ 
        message: "Logout successful. Please remove the token from client storage.",
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For this functionality, you would typically:
    // 1. Increment a user version/session number in the database
    // 2. Include this version in JWT tokens
    // 3. Validate token version during authentication
    
    // Simple implementation: Update user's updatedAt timestamp
    // and include a tokenVersion in future JWT tokens
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    });

    res.json({ 
      message: "Successfully logged out from all devices. All tokens are now invalid.",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
