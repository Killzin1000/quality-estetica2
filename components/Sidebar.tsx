import React from 'react';
import { LayoutDashboard, Users, Package, DollarSign, Calendar, LogOut, Menu, Sparkles } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isMobileOpen, setIsMobileOpen, onLogout }) => {
  const { hasPermission, isAdmin } = useAuth();

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredPermission: null }, // Everyone sees dashboard
    { id: 'patients', label: 'Pacientes & Prontuário', icon: Users, requiredPermission: 'patients' },
    { id: 'stock', label: 'Estoque Inteligente', icon: Package, requiredPermission: 'stock' },
    { id: 'financial', label: 'Financeiro', icon: DollarSign, requiredPermission: 'financial' },
    { id: 'calendar', label: 'Agenda', icon: Calendar, requiredPermission: 'calendar' },
    { id: 'skin-analysis', label: 'Skin Analysis AI', icon: Sparkles, requiredPermission: 'skin-analysis' },
  ];

  const menuItems = allMenuItems.filter(item =>
    !item.requiredPermission || hasPermission(item.requiredPermission as any)
  );

  // Add Admin Users item if admin
  if (isAdmin) {
    menuItems.push({ id: 'admin-users', label: 'Gestão de Usuários', icon: Users, requiredPermission: 'admin' } as any);
  }

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:inset-0
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="h-full flex flex-col bg-surface border-r border-white/5 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gold-500/5 blur-[50px] pointer-events-none"></div>

          <div className="p-8 flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-black/40 border border-gold-500/30 rounded-xl flex items-center justify-center text-gold-400 font-serif font-bold text-xl shadow-[0_0_15px_-3px_rgba(212,175,55,0.2)]">
              Q
            </div>
            <div>
              <span className="block text-lg font-serif font-bold text-text-primary leading-tight">Quality</span>
              <span className="text-[10px] text-gold-500/80 uppercase tracking-widest font-medium">Estética</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-text-muted ml-auto"
            >
              <LogOut size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto relative z-10">
            <div className="px-4 mb-2">
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Menu Principal</span>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as ViewState);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                    ${isActive
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-[0_0_20px_-5px_rgba(212,175,55,0.1)]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'group-hover:scale-110'}`} />
                  <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_5px_#D4AF37]"></div>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 relative z-10">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Encerrar Sessão</span>
            </button>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-text-muted/50">v1.2.0 • Quality System</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};