import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth-middleware';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const user = await User.findById(req.user!.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      user: {
        ...user.toObject(),
        userId: req.user!.userId
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del usuario' },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(handler);
