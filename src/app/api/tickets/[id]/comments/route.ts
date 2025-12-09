import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth-middleware';
import { CreateCommentDTO, UserRole } from '@/types';
import { sendEmail, ticketResponseEmail } from '@/lib/email';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST - Agregar un comentario a un ticket
async function postHandler(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (req.user!.role === UserRole.CLIENT && ticket.clientId !== req.user!.userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para comentar en este ticket' },
        { status: 403 }
      );
    }

    const body: CreateCommentDTO = await req.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'El contenido del comentario es requerido' },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const user = await User.findById(req.user!.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Crear comentario
    const comment = await Comment.create({
      ticketId: id,
      userId: req.user!.userId,
      userName: user.name,
      userRole: user.role,
      content: content.trim(),
    });

    // Actualizar lastResponseAt del ticket
    ticket.lastResponseAt = new Date();
    await ticket.save();

    // Enviar email al cliente si el comentario es de un agente
    if (user.role === UserRole.AGENT || user.role === UserRole.ADMIN) {
      try {
        await sendEmail({
          to: ticket.clientEmail,
          subject: `Nueva Respuesta en tu Ticket - HelpDeskPro`,
          html: ticketResponseEmail(
            ticket.clientName,
            id,
            ticket.title,
            user.name,
            content.trim()
          ),
        });
      } catch (emailError) {
        console.error('Error al enviar email de respuesta:', emailError);
        // No fallar la creación del comentario si el email falla
      }
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return NextResponse.json(
      { error: 'Error al crear comentario' },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(postHandler);
