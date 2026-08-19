import type { Request, Response, NextFunction } from "express";

export function fakeAuth(req: Request, res: Response, next: NextFunction) {
  req.user = { id: "477e4cc0-a61f-4f51-b8b1-3b435b1d9aaf" }; 
  next()
}