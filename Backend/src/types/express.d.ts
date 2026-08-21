// Set by requireAuth once the bearer token verifies.

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      token?: {
        jti: string;
        expiresAt: Date;
      };
    }
  }
}

export {};
