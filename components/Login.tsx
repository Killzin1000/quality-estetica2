import React, { useState } from 'react';
import { Lock, User, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface LoginProps {
  onSuccess?: () => void; // Optional now as App handles state via Context
}

export const Login: React.FC<LoginProps> = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        setSuccessMsg('Cadastro realizado! Aguarde a aprovação do administrador.');
        setIsSignUp(false); // Switch back to login
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        // Navigation is handled by App's auth state change
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-surface-highlight/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-card p-8 rounded-3xl relative z-10 border-t border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-36 h-36 mb-6">
            <img src="/logo-nobg.png" alt="Quality Estética Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-text-primary mb-2 tracking-wide">
            {isSignUp ? 'Criar Conta' : 'Bem-vindo'}
          </h1>
          <p className="text-text-secondary text-sm font-light tracking-widest uppercase">
            {isSignUp ? 'Junte-se à equipe Quality' : 'Sistema de Gestão Quality Estética'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold-400 transition-colors" size={20} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                  placeholder="Seu Nome"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Email Profissional</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold-400 transition-colors" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                placeholder="nome@quality.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold-400 transition-colors" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm animate-in slide-in-from-top-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-gold-950 font-bold py-4 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gold-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isSignUp ? 'Cadastrar' : 'Acessar Sistema'}</span>
                {isSignUp ? <CheckCircle size={18} className="opacity-50" /> : <ArrowRight size={18} className="opacity-50" />}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg(''); }}
            className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
          >
            {isSignUp ? 'Já tem uma conta? Faça Login' : 'Não tem acesso? Solicitar Cadastro'}
          </button>
        </div>
      </div>
    </div>
  );
};