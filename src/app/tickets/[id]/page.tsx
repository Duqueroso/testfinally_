'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ITicket, IComment, UserRole, TicketStatus, TicketPriority } from '@/types';
import axios from 'axios';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';

export default function TicketDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [error, setError] = useState('');

  // Estado para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    category: '',
  });

  // Estado para comentarios
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Estado para asignación de agente
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && ticketId) {
      fetchTicket();
      if (user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN) {
        fetchAgents();
      }
    }
  }, [isAuthenticated, ticketId]);

  const fetchTicket = async () => {
    try {
      setLoadingTicket(true);
      const response = await axios.get(`/api/tickets/${ticketId}`);
      setTicket(response.data.ticket);
      setComments(response.data.ticket.comments || []);
      setEditForm({
        title: response.data.ticket.title,
        description: response.data.ticket.description,
        status: response.data.ticket.status,
        priority: response.data.ticket.priority,
        category: response.data.ticket.category,
      });
      setSelectedAgent(response.data.ticket.assignedAgentId || '');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el ticket');
    } finally {
      setLoadingTicket(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get('/api/agents');
      setAgents(response.data.agents || []);
    } catch (err) {
      console.error('Error al cargar agentes:', err);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      const updateData: any = { ...editForm };
      
      if (user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN) {
        if (selectedAgent && selectedAgent !== ticket?.assignedAgentId) {
          updateData.assignedAgentId = selectedAgent;
        }
      }

      await axios.patch(`/api/tickets/${ticketId}`, updateData);
      await fetchTicket();
      setIsEditing(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar el ticket');
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await axios.post(`/api/tickets/${ticketId}/comments`, {
        content: newComment,
      });
      setNewComment('');
      await fetchTicket();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar comentario');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCloseTicket = async () => {
    if (confirm('¿Estás seguro de que deseas cerrar este ticket?')) {
      try {
        await axios.patch(`/api/tickets/${ticketId}`, {
          status: TicketStatus.CLOSED,
        });
        await fetchTicket();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cerrar el ticket');
      }
    }
  };

  if (isLoading || loadingTicket) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B91667] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Card className="glass shadow-2xl border-0">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-xl font-bold mb-6">{error || 'Ticket no encontrado'}</p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              ← Volver al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const canEdit = user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN || 
                  (user?.role === UserRole.CLIENT && ticket.clientId === user._id);

  return (
    <div className="min-h-screen gradient-light">
      <header className="gradient-dark shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
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
                <h1 className="text-3xl font-black text-white">🎫 Ticket #{ticket._id}</h1>
                <p className="text-sm text-gray-200">📅 Creado el {new Date(ticket.createdAt!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            {canEdit && !isEditing && (
              <div className="flex gap-3 animate-slide-up" style={{animationDelay: '100ms'}}>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg transition-all duration-300"
                >
                  ✏️ Editar
                </Button>
                {(user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN) && 
                 ticket.status !== TicketStatus.CLOSED && (
                  <Button 
                    variant="danger" 
                    onClick={handleCloseTicket}
                    className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    🔒 Cerrar Ticket
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg font-bold mb-6 shadow-lg animate-slide-up">
            ⚠️ {error}
          </div>
        )}

        {/* Información del Ticket */}
        <Card title="Información del Ticket" className="mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as TicketPriority })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={TicketPriority.LOW}>Baja</option>
                    <option value={TicketPriority.MEDIUM}>Media</option>
                    <option value={TicketPriority.HIGH}>Alta</option>
                    <option value={TicketPriority.URGENT}>Urgente</option>
                  </select>
                </div>

                {(user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TicketStatus })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value={TicketStatus.OPEN}>Abierto</option>
                      <option value={TicketStatus.IN_PROGRESS}>En Progreso</option>
                      <option value={TicketStatus.RESOLVED}>Resuelto</option>
                      <option value={TicketStatus.CLOSED}>Cerrado</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {(user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agente Asignado</label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Sin asignar</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateTicket}>Guardar Cambios</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h2>
                <div className="flex gap-2 mb-4">
                  <Badge variant="status" value={ticket.status} />
                  <Badge variant="priority" value={ticket.priority} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Descripción</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Categoría</p>
                  <p className="font-medium">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{ticket.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Agente Asignado</p>
                  <p className="font-medium">{ticket.assignedAgentName || 'Sin asignar'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Respuesta</p>
                  <p className="font-medium">
                    {ticket.lastResponseAt 
                      ? new Date(ticket.lastResponseAt).toLocaleString('es-ES')
                      : 'Sin respuestas'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Comentarios */}
        <Card title="Comentarios" className="mb-6">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No hay comentarios aún</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{comment.userName}</span>
                    <Badge variant="role" value={comment.userRole} />
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt!).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Agregar Comentario */}
        {ticket.status !== TicketStatus.CLOSED && (
          <Card title="Agregar Comentario">
            <form onSubmit={handleAddComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                placeholder="Escribe tu comentario aquí..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <Button type="submit" isLoading={isSubmittingComment}>
                Enviar Comentario
              </Button>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}
