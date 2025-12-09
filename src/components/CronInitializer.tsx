'use client';

import { useEffect } from 'react';

export default function CronInitializer() {
  useEffect(() => {
    // Inicializar cron jobs al cargar la aplicación
    fetch('/api/cron')
      .then(() => console.log('✅ Cron jobs inicializados'))
      .catch((err) => console.error('❌ Error al inicializar cron jobs:', err));
  }, []);

  return null;
}
