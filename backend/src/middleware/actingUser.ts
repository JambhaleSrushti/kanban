import type { RequestHandler } from "express";

declare global {
  namespace Express {
    interface Request {
      actingUserId?: string;
    }
  }
}

/** Reads the X-User-Id header set by the frontend's acting-user switcher. Not real auth. */
export const actingUser: RequestHandler = (req, _res, next) => {
  const header = req.header("X-User-Id");
  req.actingUserId = header && header.trim() !== "" ? header : undefined;
  next();
};
