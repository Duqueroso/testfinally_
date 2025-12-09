import cron from 'node-cron';
import connectDB from './mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { sendEmail, agentReminderEmail, surveyEmail } from './email';
import { TicketStatus, UserRole } from '@/types';

let cronJobsStarted = false;

export const startCronJobs = () => {
  if (cronJobsStarted) {
    console.log('⏰ Cron jobs ya están ejecutándose');
    return;
  }

  cronJobsStarted = true;
  console.log('⏰ Iniciando cron jobs...');

  // Cron job: Recordatorios de tickets sin respuesta (cada hora)
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 Ejecutando cron job: Recordatorios de tickets sin respuesta');
    
    try {
      await connectDB();

      const now = new Date();
      const hoursThreshold = 24; // Enviar recordatorio si no hay respuesta en 24 horas
      const thresholdDate = new Date(now.getTime() - hoursThreshold * 60 * 60 * 1000);

      // Buscar tickets abiertos o en progreso sin respuesta reciente
      const tickets = await Ticket.find({
        status: { $in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
        $or: [
          { lastResponseAt: { $lt: thresholdDate } },
          { lastResponseAt: null }
        ],
        assignedAgentId: { $exists: true, $ne: null }
      });

      console.log(`📋 Encontrados ${tickets.length} tickets sin respuesta`);

      for (const ticket of tickets) {
        const agent = await User.findById(ticket.assignedAgentId);
        
        if (agent && agent.email) {
          const lastResponse = ticket.lastResponseAt || ticket.createdAt || new Date();
          const hoursSinceResponse = Math.floor((now.getTime() - lastResponse.getTime()) / (1000 * 60 * 60));

          try {
            await sendEmail({
              to: agent.email,
              subject: `Recordatorio: Ticket ${ticket._id} sin respuesta`,
              html: agentReminderEmail(
                agent.name,
                ticket._id!.toString(),
                ticket.title,
                hoursSinceResponse
              ),
            });
            console.log(`✅ Recordatorio enviado a ${agent.email} para ticket ${ticket._id}`);
          } catch (emailError) {
            console.error(`❌ Error al enviar email a ${agent.email}:`, emailError);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error en cron job de recordatorios:', error);
    }
  });

  // Cron job: Encuestas de satisfacción (cada día a las 10:00 AM)
  cron.schedule('0 10 * * *', async () => {
    console.log('📧 Ejecutando cron job: Encuestas de satisfacción');
    
    try {
      await connectDB();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar tickets cerrados en las últimas 24 horas
      const closedTickets = await Ticket.find({
        status: TicketStatus.CLOSED,
        closedAt: { $gte: yesterday, $lt: today }
      });

      console.log(`📋 Encontrados ${closedTickets.length} tickets cerrados ayer`);

      for (const ticket of closedTickets) {
        try {
          await sendEmail({
            to: ticket.clientEmail,
            subject: 'Tu opinión sobre el soporte recibido - TuTicketPro',
            html: surveyEmail(
              ticket.clientName,
              ticket._id!.toString(),
              ticket.title
            ),
          });
          console.log(`✅ Encuesta enviada a ${ticket.clientEmail} para ticket ${ticket._id}`);
        } catch (emailError) {
          console.error(`❌ Error al enviar encuesta a ${ticket.clientEmail}:`, emailError);
        }
      }
    } catch (error) {
      console.error('❌ Error en cron job de encuestas:', error);
    }
  });

  // Cron job: Detección de tickets sin asignar (cada 2 horas)
  cron.schedule('0 */2 * * *', async () => {
    console.log('🔍 Ejecutando cron job: Detección de tickets sin asignar');
    
    try {
      await connectDB();

      const unassignedTickets = await Ticket.find({
        status: TicketStatus.OPEN,
        $or: [
          { assignedAgentId: null },
          { assignedAgentId: { $exists: false } }
        ]
      });

      if (unassignedTickets.length > 0) {
        console.log(`⚠️  Hay ${unassignedTickets.length} tickets sin asignar`);

        // Obtener todos los agentes
        const agents = await User.find({ role: UserRole.AGENT });

        if (agents.length > 0) {
          // Enviar notificación a todos los agentes
          for (const agent of agents) {
            try {
              await sendEmail({
                to: agent.email,
                subject: `${unassignedTickets.length} tickets pendientes de asignación`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ea580c;">Tickets Pendientes - TuTicketPro</h2>
                    <p>Hola ${agent.name},</p>
                    <p>Hay <strong>${unassignedTickets.length} tickets</strong> esperando ser asignados.</p>
                    <p>Por favor, revisa el sistema y asigna los tickets disponibles.</p>
                    <p style="color: #6b7280; font-size: 14px;">TuTicketPro - Sistema de Tickets</p>
                  </div>
                `,
              });
            } catch (emailError) {
              console.error(`❌ Error al enviar notificación a ${agent.email}:`, emailError);
            }
          }
        }
      } else {
        console.log('✅ Todos los tickets están asignados');
      }
    } catch (error) {
      console.error('❌ Error en cron job de tickets sin asignar:', error);
    }
  });

  console.log('✅ Cron jobs configurados exitosamente');
  console.log('   - Recordatorios de tickets sin respuesta: cada hora');
  console.log('   - Encuestas de satisfacción: diariamente a las 10:00 AM');
  console.log('   - Detección de tickets sin asignar: cada 2 horas');
};
