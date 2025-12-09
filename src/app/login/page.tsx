'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirigir al dashboard (que se adapta según el rol)
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-3 animate-float">🎫 HelpDeskPro</h1>
          <p className="text-gray-300 text-lg">Inicia sesión en tu cuenta</p>
        </div>

        <Card className="glass border-0 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg font-medium">
                {error}
              </div>
            )}

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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91667] focus:border-[#B91667] transition-all duration-300 hover:border-gray-300 shadow-sm focus:shadow-md"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
              isLoading={isLoading}
            >
              {isLoading ? '⏳ Iniciando...' : '🚀 Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">¿No tienes cuenta?</span>{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-[#B91667] hover:text-[#411941] font-bold transition-all duration-300 underline decoration-2 underline-offset-2 hover:decoration-[#411941]"
            >
              Regístrate aquí
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
