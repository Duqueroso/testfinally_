'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B91667] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen gradient-light">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12 animate-slide-up">
            <div className="text-7xl mb-6 animate-float">🎫</div>
            <h1 className="text-6xl font-black mb-6">
              <span className="text-gradient">TuTicketPro</span>
            </h1>
            <p className="text-2xl text-gray-700 mb-8 font-medium">
              Sistema de Gestión de Tickets de Soporte Técnico
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/login')}
                className="shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
              >
                🚀 Iniciar Sesión
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/register')}
                className="border-2 border-[#B91667] text-[#B91667] hover:bg-[#B91667] hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
              >
                ✨ Registrarse
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="glass border-0 p-8 rounded-2xl shadow-xl hover-lift animate-slide-up" style={{animationDelay: '100ms'}}>
              <div className="text-5xl mb-4 animate-float">🎫</div>
              <h3 className="text-xl font-black mb-3 text-[#25252A]">Gestión de Tickets</h3>
              <p className="text-gray-600 leading-relaxed">
                Crea, actualiza y realiza seguimiento de todos tus tickets de soporte
              </p>
            </div>

            <div className="glass border-0 p-8 rounded-2xl shadow-xl hover-lift animate-slide-up" style={{animationDelay: '200ms'}}>
              <div className="text-5xl mb-4 animate-float" style={{animationDelay: '0.5s'}}>👥</div>
              <h3 className="text-xl font-black mb-3 text-[#25252A]">Roles Diferenciados</h3>
              <p className="text-gray-600 leading-relaxed">
                Vistas especializadas para clientes, agentes y administradores
              </p>
            </div>

            <div className="glass border-0 p-8 rounded-2xl shadow-xl hover-lift animate-slide-up" style={{animationDelay: '300ms'}}>
              <div className="text-5xl mb-4 animate-float" style={{animationDelay: '1s'}}>📧</div>
              <h3 className="text-xl font-black mb-3 text-[#25252A]">Notificaciones</h3>
              <p className="text-gray-600 leading-relaxed">
                Recibe alertas automáticas por correo sobre el estado de tus tickets
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 glass border-0 rounded-2xl shadow-2xl p-10 hover-lift animate-slide-up" style={{animationDelay: '400ms'}}>
            <h2 className="text-3xl font-black mb-8 text-gradient">¿Por qué TuTicketPro?</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="transform hover:scale-110 transition-all duration-300">
                <div className="text-4xl font-black text-[#B91667] mb-3">24/7</div>
                <p className="text-gray-700 font-medium">Disponibilidad</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <div className="text-4xl font-black text-[#411941] mb-3">100%</div>
                <p className="text-gray-700 font-medium">Trazabilidad</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <div className="text-4xl font-black text-[#3598AE] mb-3">∞</div>
                <p className="text-gray-700 font-medium">Tickets</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <div className="text-4xl font-black text-[#E5E183] mb-3">✓</div>
                <p className="text-gray-700 font-medium">Seguro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
