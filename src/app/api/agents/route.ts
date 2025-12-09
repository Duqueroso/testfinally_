import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth-middleware';
import { UserRole } from '@/types';

// GET - Obtener lista de agentes disponibles
async function getHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    // Solo agentes y admins pueden ver la lista de agentes
    if (req.user!.role === UserRole.CLIENT) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver esta información' },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios con rol AGENT
    const agents = await User.find(
      { role: UserRole.AGENT },
      { _id: 1, name: 1, email: 1 }
    ).lean();

    return NextResponse.json({ agents }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener agentes:', error);
    return NextResponse.json(
      { error: 'Error al obtener agentes' },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(getHandler);
