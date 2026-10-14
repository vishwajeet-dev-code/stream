import { ApiError } from "../utils/ApiError.js";

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const verifyAllowedOrigin = (req, res, next) => {
  const origin = req.get("Origin");

  if (origin && !allowedOrigins.includes(origin)) {
    return next(new ApiError(403, "Request origin is not allowed"));
  }

  return next();
};
