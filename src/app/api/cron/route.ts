import { startCronJobs } from '@/lib/cron';

// Iniciar cron jobs cuando se carga la aplicación
if (process.env.NODE_ENV !== 'test') {
  startCronJobs();
}

export async function GET() {
  return Response.json({ message: 'Cron jobs initialized' });
}
