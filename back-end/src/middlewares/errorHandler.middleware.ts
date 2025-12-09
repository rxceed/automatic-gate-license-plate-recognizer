import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If error is thrown using ApiError class
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Mongoose specific errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors,
    });
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error",
      key: err.keyValue,
    });
  }

  // For unexpected errors
  console.error("🔥 UNEXPECTED ERROR:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });

  next();
};
