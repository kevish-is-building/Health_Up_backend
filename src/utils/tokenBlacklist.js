import jwt from "jsonwebtoken";

// In-memory blacklist (for development/small apps)
// For production, use Redis or database
const tokenBlacklist = new Set();

export const addTokenToBlacklist = (token) => {
  try {
    // Decode token to get expiration
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // Store token with expiration time
      tokenBlacklist.add(token);
      
      // Auto-remove token after expiration
      const now = Math.floor(Date.now() / 1000);
      const timeToExpiry = (decoded.exp - now) * 1000;
      
      if (timeToExpiry > 0) {
        setTimeout(() => {
          tokenBlacklist.delete(token);
        }, timeToExpiry);
      }
    }
    return true;
  } catch (error) {
    console.error("Error adding token to blacklist:", error);
    return false;
  }
};

export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

export const clearExpiredTokens = () => {
  // This function can be called periodically to clean up expired tokens
  // For now, we rely on setTimeout for auto-cleanup
  console.log("Token cleanup - blacklist size:", tokenBlacklist.size);
};

// Database-based blacklist functions (uncomment if using database)
/*
import prisma from "../config/prisma.js";

export const addTokenToBlacklistDB = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      await prisma.tokenBlacklist.create({
        data: {
          token: token,
          expiresAt: new Date(decoded.exp * 1000)
        }
      });
    }
    return true;
  } catch (error) {
    console.error("Error adding token to blacklist:", error);
    return false;
  }
};

export const isTokenBlacklistedDB = async (token) => {
  try {
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { token }
    });
    return !!blacklistedToken;
  } catch (error) {
    console.error("Error checking token blacklist:", error);
    return false;
  }
};
*/