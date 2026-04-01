import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("[Auth] Authorization header:", authHeader ? "Present" : "Missing");

    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.log("[Auth] No token provided");
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("[Auth] Token received, verifying...");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    console.log("[Auth] Token decoded, userId:", decoded.userId);

    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log("[Auth] User not found for userId:", decoded.userId);
      return res.status(401).json({ message: "User not found" });
    }

    console.log("[Auth] User authenticated:", user.email);

    // Set both _id and id for compatibility
    const userObject = user.toObject();
    req.user = {
      ...userObject,
      id: String(userObject._id),
      userId: String(userObject._id), // Add userId for controller compatibility
    };
    next();
  } catch (error) {
    console.error("[Auth] Authentication error:", error);
    res.status(401).json({ message: "Invalid authentication token" });
  }
};
