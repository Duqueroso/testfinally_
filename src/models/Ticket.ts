import mongoose, { Schema, Model } from 'mongoose';
import { ITicket, TicketStatus, TicketPriority } from '@/types';

const TicketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.MEDIUM,
      required: true,
    },
    clientId: {
      type: String,
      required: [true, 'El ID del cliente es requerido'],
      ref: 'User',
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    assignedAgentId: {
      type: String,
      ref: 'User',
    },
    assignedAgentName: {
      type: String,
    },
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
      trim: true,
    },
    lastResponseAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para consultas eficientes
TicketSchema.index({ clientId: 1, createdAt: -1 });
TicketSchema.index({ assignedAgentId: 1, status: 1 });
TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ lastResponseAt: 1 });

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
