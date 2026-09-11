import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { AuthService } from '../services/AuthService';
import { AuditService } from '../services/AuditService';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, mobile, password, role, language } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or mobile number already exists',
          code: 'USER_EXISTS',
        });
      }

      const passwordHash = await AuthService.hashPassword(password);
      const user = await User.create({
        name,
        email,
        mobile,
        passwordHash,
        role: role || 'CUSTOMER',
        language: language || 'en',
        isEmailVerified: true,
        isMobileVerified: true,
      });

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      user.refreshTokenHash = await AuthService.hashPassword(refreshToken);
      await user.save();

      await AuditService.logAction({
        actorId: user._id.toString(),
        actorRole: user.role,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user._id.toString(),
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: AuthService.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Registration failed',
        code: 'REGISTRATION_FAILED',
      });
    }
  }

  static async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      const isMatch = await AuthService.comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      user.refreshTokenHash = await AuthService.hashPassword(refreshToken);
      await user.save();

      await AuditService.logAction({
        actorId: user._id.toString(),
        actorRole: user.role,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user._id.toString(),
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: AuthService.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Login failed',
        code: 'LOGIN_FAILED',
      });
    }
  }

  static async refreshToken(req: AuthenticatedRequest, res: Response) {
    try {
      const { refreshToken } = req.body;
      const decoded = AuthService.verifyRefreshToken(refreshToken);

      const user = await User.findById(decoded.userId);
      if (!user || !user.refreshTokenHash) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        });
      }

      const isMatch = await AuthService.comparePassword(refreshToken, user.refreshTokenHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token mismatch or revoked',
          code: 'REFRESH_TOKEN_EXPIRED',
        });
      }

      const newAccessToken = AuthService.generateAccessToken(user);
      const newRefreshToken = AuthService.generateRefreshToken(user);

      user.refreshTokenHash = await AuthService.hashPassword(newRefreshToken);
      await user.save();

      return res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      return res.status(200).json({
        success: true,
        data: AuthService.sanitizeUser(user),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        code: 'SERVER_ERROR',
      });
    }
  }
}
