'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TicketPriority } from '@/types';
import axios from 'axios';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function NewTicketPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TicketPriority.MEDIUM,
    category: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/tickets', formData);
      router.push(`/tickets/${response.data.ticket._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear el ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B91667] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen gradient-light">
      <header className="gradient-dark shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-6 animate-slide-up">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg transition-all duration-300"
            >
              ← Volver
            </Button>
            <div>
              <h1 className="text-4xl font-black text-white">✨ Crear Nuevo Ticket</h1>
              <p className="text-sm text-gray-200 mt-1">Completa el formulario para crear tu solicitud</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="glass shadow-2xl border-0 hover-lift animate-slide-up" style={{animationDelay: '100ms'}}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-black text-[#25252A] mb-2 uppercase tracking-wider">
                📌 Título del Ticket *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md text-lg"
                placeholder="Ej: Problema con el inicio de sesión"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-black text-[#25252A] mb-2 uppercase tracking-wider">
                📁 Categoría *
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md text-lg"
                placeholder="Ej: Técnico, Facturación, Acceso, Otro"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-black text-[#25252A] mb-2 uppercase tracking-wider">
                🚨 Prioridad *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md text-lg font-medium"
              >
                <option value={TicketPriority.LOW}>🟢 Baja</option>
                <option value={TicketPriority.MEDIUM}>🟡 Media</option>
                <option value={TicketPriority.HIGH}>🟠 Alta</option>
                <option value={TicketPriority.URGENT}>🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-black text-[#25252A] mb-2 uppercase tracking-wider">
                📝 Descripción del Problema *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={8}
                maxLength={2000}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md resize-none text-lg leading-relaxed"
                placeholder="Describe detalladamente el problema que estás experimentando..."
              />
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {formData.description.length}/2000 caracteres
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 text-lg py-4 font-bold"
                isLoading={isSubmitting}
              >
                {isSubmitting ? '⏳ Creando...' : '🚀 Crear Ticket'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isSubmitting}
                className="hover:scale-105 transition-all duration-300"
              >
                ✖️ Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
