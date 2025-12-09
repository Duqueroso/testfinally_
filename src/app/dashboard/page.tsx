'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole, ITicket, TicketStatus, TicketPriority } from '@/types';
import axios from 'axios';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      const queryString = params.toString();
      const response = await axios.get(`/api/tickets${queryString ? `?${queryString}` : ''}`);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#B91667] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-light">
      {/* Header */}
      <header className="gradient-dark shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl font-black text-white mb-2">🎫 HelpDeskPro</h1>
              <p className="text-sm text-gray-200">
                👋 Bienvenido, <span className="font-bold">{user.name}</span> <Badge variant="role" value={user.role} className="ml-2 shadow-md" />
              </p>
              {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
                <p className="text-xs text-gray-300 mt-2">
                  🎯 Tu ID: <code className="bg-white/20 px-3 py-1 rounded-lg text-xs text-white font-mono backdrop-blur-sm">{user.userId}</code>
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🚪 Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filtros por Estado */}
        <div className="mb-6 animate-slide-up">
          <h3 className="text-sm font-black text-[#25252A] mb-4 uppercase tracking-wider flex items-center gap-2">
            🎯 Filtrar por Estado:
          </h3>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === TicketStatus.OPEN ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(TicketStatus.OPEN)}
            >
              Abiertos
            </Button>
            <Button
              variant={statusFilter === TicketStatus.IN_PROGRESS ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(TicketStatus.IN_PROGRESS)}
            >
              En Progreso
            </Button>
            <Button
              variant={statusFilter === TicketStatus.RESOLVED ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(TicketStatus.RESOLVED)}
            >
              Resueltos
            </Button>
            <Button
              variant={statusFilter === TicketStatus.CLOSED ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(TicketStatus.CLOSED)}
            >
              Cerrados
            </Button>
          </div>
        </div>

        {/* Filtros por Prioridad */}
        <div className="mb-6 animate-slide-up" style={{animationDelay: '100ms'}}>
          <h3 className="text-sm font-black text-[#25252A] mb-4 uppercase tracking-wider flex items-center gap-2">
            🚨 Filtrar por Prioridad:
          </h3>
          <div className="flex gap-3 flex-wrap items-center">
            <Button
              variant={priorityFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPriorityFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={priorityFilter === TicketPriority.LOW ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPriorityFilter(TicketPriority.LOW)}
            >
              Baja
            </Button>
            <Button
              variant={priorityFilter === TicketPriority.MEDIUM ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPriorityFilter(TicketPriority.MEDIUM)}
            >
              Media
            </Button>
            <Button
              variant={priorityFilter === TicketPriority.HIGH ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPriorityFilter(TicketPriority.HIGH)}
            >
              Alta
            </Button>
            <Button
              variant={priorityFilter === TicketPriority.URGENT ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPriorityFilter(TicketPriority.URGENT)}
            >
              Urgente
            </Button>

            {user.role === UserRole.CLIENT && (
              <Button
                variant="success"
                size="sm"
                onClick={() => router.push('/tickets/new')}
                className="ml-auto"
              >
                + Nuevo Ticket
              </Button>
            )}
          </div>
        </div>

        {/* Tickets List */}
        {loadingTickets ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B91667] border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Cargando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="hover-lift animate-slide-up" style={{animationDelay: '200ms'}}>
            <div className="text-center py-20">
              <div className="text-7xl mb-6 animate-float">📝</div>
              <p className="text-gray-600 text-xl mb-6 font-medium">No hay tickets disponibles</p>
              {user.role === UserRole.CLIENT && (
                <Button 
                  onClick={() => router.push('/tickets/new')}
                  className="shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  ✨ Crear tu primer ticket
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket, index) => (
              <Card
                key={ticket._id}
                hoverable
                className="cursor-pointer hover-lift animate-slide-up glass"
                style={{animationDelay: `${index * 50}ms`}}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1" onClick={() => router.push(`/tickets/${ticket._id}`)}>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 hover:text-[#B91667] transition-colors">
                        {ticket.title}
                      </h3>
                      <Badge variant="status" value={ticket.status} className="shadow-sm" />
                      <Badge variant="priority" value={ticket.priority} className="shadow-sm" />
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">📁 {ticket.category}</span>
                      {user.role !== UserRole.CLIENT && (
                        <span className="flex items-center gap-1">👤 {ticket.clientName}</span>
                      )}
                      {ticket.assignedAgentName && (
                        <span className="flex items-center gap-1 text-[#3598AE]">🎯 {ticket.assignedAgentName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        📅 {new Date(ticket.createdAt!).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tickets/${ticket._id}`);
                      }}
                    >
                      Ver Detalle
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
