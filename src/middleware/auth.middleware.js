import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // Check if token is blacklisted
      if (isTokenBlacklisted(token)) {
        return res.status(401).json({ message: "Token has been invalidated" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, email: true },
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }
  res.status(401).json({ message: "No token provided" });
};
