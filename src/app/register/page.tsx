'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      await register({ name, email, password, role });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-3 animate-float">🎫 HelpDeskPro</h1>
          <p className="text-gray-300 text-lg">Crea tu cuenta</p>
        </div>

        <Card className="glass border-0 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-bold text-[#25252A] mb-2">
                👤 Nombre Completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#25252A] mb-2">
                📧 Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#25252A] mb-2">
                🔒 Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-600 mt-2 font-medium">ℹ️ Mínimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-bold text-[#25252A] mb-2">
                🎭 Tipo de Usuario
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md font-medium"
              >
                <option value={UserRole.CLIENT}>💼 Cliente</option>
                <option value={UserRole.AGENT}>👨‍💻 Agente</option>
                <option value={UserRole.ADMIN}>🔑 Administrador</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
              isLoading={isLoading}
            >
              {isLoading ? '⏳ Registrando...' : '✨ Registrarse'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">¿Ya tienes cuenta?</span>{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-[#B91667] hover:text-[#411941] font-bold transition-all duration-300 underline decoration-2 underline-offset-2 hover:decoration-[#411941]"
            >
              Inicia sesión aquí
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
