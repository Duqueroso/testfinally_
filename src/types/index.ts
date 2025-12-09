// Enums para estados y roles
export enum UserRole {
  CLIENT = 'client',
  AGENT = 'agent',
  ADMIN = 'admin'
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Interface para Usuario
export interface IUser {
  _id?: string;
  userId?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para Comentario
export interface IComment {
  _id?: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt?: Date;
}

// Interface para Ticket
export interface ITicket {
  _id?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  clientId: string;
  clientName: string;
  clientEmail: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  category: string;
  comments?: IComment[];
  lastResponseAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  closedAt?: Date;
}

// DTOs para formularios
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateTicketDTO {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
}

export interface UpdateTicketDTO {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAgentId?: string;
  category?: string;
}

export interface CreateCommentDTO {
  ticketId: string;
  content: string;
}

// Interface para respuesta de autenticación
export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

// Interface para el contexto de autenticación
export interface AuthContextType {
  user: IUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Interface para JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
