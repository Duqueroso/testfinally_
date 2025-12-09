import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"HelpDeskPro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email enviado a ${to}`);
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

// Templates de emails

export const ticketCreatedEmail = (clientName: string, ticketId: string, title: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Ticket Creado - HelpDeskPro</h2>
      <p>Hola ${clientName},</p>
      <p>Tu ticket ha sido creado exitosamente y será atendido pronto.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>ID del Ticket:</strong> ${ticketId}</p>
        <p><strong>Título:</strong> ${title}</p>
      </div>
      <p>Recibirás notificaciones cuando haya actualizaciones en tu ticket.</p>
      <p style="color: #6b7280; font-size: 14px;">Gracias por usar HelpDeskPro</p>
    </div>
  `;
};

export const ticketResponseEmail = (
  clientName: string,
  ticketId: string,
  title: string,
  agentName: string,
  comment: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Nueva Respuesta - HelpDeskPro</h2>
      <p>Hola ${clientName},</p>
      <p>Has recibido una nueva respuesta de <strong>${agentName}</strong> en tu ticket.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>ID del Ticket:</strong> ${ticketId}</p>
        <p><strong>Título:</strong> ${title}</p>
        <hr style="border: 1px solid #d1d5db; margin: 15px 0;">
        <p><strong>Respuesta:</strong></p>
        <p>${comment}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Gracias por usar HelpDeskPro</p>
    </div>
  `;
};

export const ticketClosedEmail = (clientName: string, ticketId: string, title: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Ticket Cerrado - HelpDeskPro</h2>
      <p>Hola ${clientName},</p>
      <p>Tu ticket ha sido marcado como <strong>cerrado</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>ID del Ticket:</strong> ${ticketId}</p>
        <p><strong>Título:</strong> ${title}</p>
      </div>
      <p>Si necesitas más ayuda, no dudes en crear un nuevo ticket.</p>
      <p style="color: #6b7280; font-size: 14px;">Gracias por usar HelpDeskPro</p>
    </div>
  `;
};

export const agentReminderEmail = (agentName: string, ticketId: string, title: string, hoursWithoutResponse: number): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">Recordatorio: Ticket Sin Respuesta</h2>
      <p>Hola ${agentName},</p>
      <p>Este ticket lleva <strong>${hoursWithoutResponse} horas</strong> sin respuesta.</p>
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p><strong>ID del Ticket:</strong> ${ticketId}</p>
        <p><strong>Título:</strong> ${title}</p>
      </div>
      <p>Por favor, revisa y responde cuando sea posible.</p>
      <p style="color: #6b7280; font-size: 14px;">HelpDeskPro - Sistema de Tickets</p>
    </div>
  `;
};

export const surveyEmail = (clientName: string, ticketId: string, title: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Tu Opinión es Importante - HelpDeskPro</h2>
      <p>Hola ${clientName},</p>
      <p>Tu ticket ha sido cerrado recientemente. Nos gustaría conocer tu experiencia.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>ID del Ticket:</strong> ${ticketId}</p>
        <p><strong>Título:</strong> ${title}</p>
      </div>
      <p>Por favor, tómate un momento para calificar nuestro servicio:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="display: inline-block; margin: 0 5px; padding: 10px 20px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px;">😊 Excelente</a>
        <a href="#" style="display: inline-block; margin: 0 5px; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">🙂 Bueno</a>
        <a href="#" style="display: inline-block; margin: 0 5px; padding: 10px 20px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px;">😐 Regular</a>
        <a href="#" style="display: inline-block; margin: 0 5px; padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px;">😞 Malo</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Gracias por usar HelpDeskPro</p>
    </div>
  `;
};
