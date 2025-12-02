import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken, 
  revokeRefreshToken,
  revokeAllUserRefreshTokens 
} from "../utils/generateToken.js";
import { addTokenToBlacklist } from "../utils/tokenBlacklist.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("-->>>>", req.body)

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, provider: "LOCAL" },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken,
      refreshToken,
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

    if (user.provider === "GOOGLE" && !user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { refreshToken } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Add access token to blacklist
    const blacklistSuccess = addTokenToBlacklist(token);
    
    // Revoke refresh token if provided
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    } else {
      // If no specific refresh token, revoke all user's refresh tokens
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await revokeAllUserRefreshTokens(decoded.id);
      } catch (err) {
        // Token might be expired, continue with logout
      }
    }
    
    res.json({ 
      message: "Logout successful. All tokens have been invalidated.",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Refresh access token using refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const tokenRecord = await verifyRefreshToken(refreshToken);
    if (!tokenRecord) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const accessToken = generateAccessToken(tokenRecord.user.id);
    
    res.json({
      accessToken,
      user: {
        id: tokenRecord.user.id,
        username: tokenRecord.user.username,
        email: tokenRecord.user.email,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Google OAuth login
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    // Check if user exists with Google ID
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // Check if user exists with same email
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            provider: "GOOGLE",
            image: picture,
            isVerified: true,
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            googleId,
            username: name,
            email,
            image: picture,
            provider: "GOOGLE",
            isVerified: true,
          },
        });
      }
    } else {
      // Update user info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: name,
          image: picture,
        },
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      image: user.image,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(400).json({ message: "Invalid Google token" });
  }
};
