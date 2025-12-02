import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma.js";

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

export const verifyRefreshToken = async (token) => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!refreshToken || refreshToken.expiresAt < new Date()) {
    if (refreshToken) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
    }
    return null;
  }

  return refreshToken;
};

export const revokeRefreshToken = async (token) => {
  try {
    await prisma.refreshToken.delete({ where: { token } });
    return true;
  } catch (error) {
    return false;
  }
};

export const revokeAllUserRefreshTokens = async (userId) => {
  try {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    return true;
  } catch (error) {
    return false;
  }
};

// Legacy function for backward compatibility
export const generateToken = (id) => {
  return generateAccessToken(id);
};
