import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User';
import { config } from '../config/env';
import { UserRole } from '../../../shared/src/index';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(user: IUserDocument): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );
  }

  static generateRefreshToken(user: IUserDocument): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
      },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn as any }
    );
  }

  static verifyAccessToken(token: string): any {
    return jwt.verify(token, config.jwtSecret);
  }

  static verifyRefreshToken(token: string): any {
    return jwt.verify(token, config.jwtRefreshSecret);
  }

  static sanitizeUser(user: IUserDocument) {
    const obj = user.toObject();
    delete (obj as any).passwordHash;
    delete (obj as any).refreshTokenHash;
    return obj;
  }
}
