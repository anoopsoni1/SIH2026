import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../shared/index';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    email: string;
    name: string;
  };
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing or invalid',
      code: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = AuthService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token has expired or is invalid',
      code: 'INVALID_TOKEN',
    });
  }
};
