import type { Request, Response, NextFunction } from "express";

export function fakeAuth(req: Request, res: Response, next: NextFunction) {
  req.user = { id: "cc63c5d4-30e7-4af1-b8de-0c3f6a69de9b" }; 
  next()
}