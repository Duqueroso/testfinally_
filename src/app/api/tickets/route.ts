import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth-middleware';
import { CreateTicketDTO, UserRole } from '@/types';
import { sendEmail, ticketCreatedEmail } from '@/lib/email';

// GET - Obtener todos los tickets según el rol
async function getHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let query: any = {};

    // Filtrar según el rol del usuario
    if (req.user!.role === UserRole.CLIENT) {
      query.clientId = req.user!.userId;
    } else if (req.user!.role === UserRole.AGENT) {
      // Los agentes pueden ver tickets asignados o sin asignar
      const agentFilter = searchParams.get('assigned');
      if (agentFilter === 'me') {
        query.assignedAgentId = req.user!.userId;
      }
    }

    // Filtros adicionales
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo ticket
async function postHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const body: CreateTicketDTO = await req.json();
    const { title, description, priority, category } = body;

    if (!title || !description || !priority || !category) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Obtener información del cliente
    const user = await User.findById(req.user!.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Crear ticket
    const newTicket = await Ticket.create({
      title,
      description,
      priority,
      category,
      clientId: user._id!.toString(),
      clientName: user.name,
      clientEmail: user.email,
    });

    // Enviar email de notificación al cliente
    try {
      await sendEmail({
        to: user.email,
        subject: 'Ticket Creado - HelpDeskPro',
        html: ticketCreatedEmail(user.name, newTicket._id!.toString(), title),
      });
    } catch (emailError) {
      console.error('Error al enviar email de creación de ticket:', emailError);
      // No fallar la creación del ticket si el email falla
    }

    return NextResponse.json({ ticket: newTicket }, { status: 201 });
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return NextResponse.json(
      { error: 'Error al crear ticket' },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(getHandler);
export const POST = authMiddleware(postHandler);
