import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { AppError } from "../utils/AppError";
import { verifyToken, JwtPayload } from "../utils/jwt";

const userRepository = AppDataSource.getRepository(User);

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  let payload: JwtPayload;

  try {
    payload = verifyToken(token);
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await userRepository.findOne({
    where: { id: payload.userId },
  });

  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }

  req.user = user;

  next();
};