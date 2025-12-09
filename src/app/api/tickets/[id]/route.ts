import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth-middleware';
import { UpdateTicketDTO, UserRole } from '@/types';
import { sendEmail, ticketClosedEmail } from '@/lib/email';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Obtener un ticket específico con sus comentarios
async function getHandler(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const ticket = await Ticket.findById(id).lean();

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos: clientes solo pueden ver sus propios tickets
    if (req.user!.role === UserRole.CLIENT && ticket.clientId !== req.user!.userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver este ticket' },
        { status: 403 }
      );
    }

    // Obtener comentarios del ticket
    const comments = await Comment.find({ ticketId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      { ticket: { ...ticket, comments } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar un ticket
async function patchHandler(req: AuthenticatedRequest, { params }: RouteParams) {
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
        { error: 'No tienes permisos para modificar este ticket' },
        { status: 403 }
      );
    }

    const body: UpdateTicketDTO = await req.json();

    // Guardar estado anterior para detectar cambio a cerrado
    const previousStatus = ticket.status;

    // Los clientes solo pueden actualizar título, descripción y prioridad
    if (req.user!.role === UserRole.CLIENT) {
      const { title, description, priority } = body;
      if (title) ticket.title = title;
      if (description) ticket.description = description;
      if (priority) ticket.priority = priority;
    } else {
      // Agentes y admins pueden actualizar todo
      const { title, description, status, priority, assignedAgentId, category } = body;
      
      if (title) ticket.title = title;
      if (description) ticket.description = description;
      if (status) {
        ticket.status = status;
        if (status === 'closed') {
          ticket.closedAt = new Date();
        }
      }
      if (priority) ticket.priority = priority;
      if (category) ticket.category = category;
      
      if (assignedAgentId) {
        const agent = await User.findById(assignedAgentId);
        if (agent && agent.role === UserRole.AGENT) {
          ticket.assignedAgentId = assignedAgentId;
          ticket.assignedAgentName = agent.name;
        }
      }
    }

    await ticket.save();

    // Enviar email si el ticket fue cerrado
    if (previousStatus !== 'closed' && ticket.status === 'closed') {
      try {
        await sendEmail({
          to: ticket.clientEmail,
          subject: 'Ticket Cerrado - TuTicketPro',
          html: ticketClosedEmail(ticket.clientName, id, ticket.title),
        });
      } catch (emailError) {
        console.error('Error al enviar email de cierre de ticket:', emailError);
        // No fallar la actualización si el email falla
      }
    }

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un ticket (solo admins)
async function deleteHandler(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar tickets' },
        { status: 403 }
      );
    }

    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar comentarios asociados
    await Comment.deleteMany({ ticketId: id });

    return NextResponse.json(
      { message: 'Ticket eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar ticket:', error);
    return NextResponse.json(
      { error: 'Error al eliminar ticket' },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(getHandler);
export const PATCH = authMiddleware(patchHandler);
export const DELETE = authMiddleware(deleteHandler);
