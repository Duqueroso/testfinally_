import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { UserRole } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export const authMiddleware = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
  return async (req: AuthenticatedRequest, context?: any): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Token no proporcionado' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }
  };
};

export const requireRole = (roles: UserRole[]) => {
  return (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
    return authMiddleware(async (req: AuthenticatedRequest, context?: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return NextResponse.json(
          { error: 'No tienes permisos para acceder a este recurso' },
          { status: 403 }
        );
      }
      return handler(req, context);
    });
  };
};
