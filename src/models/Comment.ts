import mongoose, { Schema, Model } from 'mongoose';
import { IComment, UserRole } from '@/types';

const CommentSchema = new Schema<IComment>(
  {
    ticketId: {
      type: String,
      required: [true, 'El ID del ticket es requerido'],
      ref: 'Ticket',
    },
    userId: {
      type: String,
      required: [true, 'El ID del usuario es requerido'],
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    content: {
      type: String,
      required: [true, 'El contenido del comentario es requerido'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
CommentSchema.index({ ticketId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
