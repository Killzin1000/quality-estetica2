import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StockForm } from './components/StockForm';
import { PatientProfile } from './components/PatientProfile';
import { PatientList } from './components/PatientList';
import { Dashboard } from './components/Dashboard';
import { Financials } from './components/Financials';
import { Login } from './components/Login';
import { MvpSkinAnalysis } from './components/MvpSkinAnalysis';
import { CalendarView } from './components/CalendarView';
import { AdminUsers } from './components/AdminUsers';
import { ViewState, Product, Patient } from './types';
import { Menu, Loader, Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, profile, isLoading, hasPermission, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global State (Mocking Supabase for Products for now, but Auth is real)
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Toxina Botulínica Tipo A',
      brand: 'Botox',
      lotNumber: 'BX202399',
      expiryDate: '2023-11-15',
      costPrice: 800,
      salePrice: 1500,
      supplier: 'Allergan',
      quantity: 3
    },
    {
      id: '2',
      name: 'Ácido Hialurônico 1ml',
      brand: 'Restylane',
      lotNumber: 'RS88221',
      expiryDate: '2024-06-20',
      costPrice: 600,
      salePrice: 1200,
      supplier: 'Galderma',
      quantity: 10
    }
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, show Login
  if (!user) {
    return <Login />;
  }

  // If logged in but profile not loaded yet or pending
  if (!profile || profile.status === 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Aguardando Aprovação</h2>
          <p className="text-text-secondary text-sm mb-6">
            O seu cadastro foi realizado com sucesso e está pendente de aprovação por um administrador.
            Por favor, aguarde ou entre em contato com a gestão.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="text-gold-400 hover:text-white text-sm font-medium transition-colors bg-gold-500/10 px-4 py-2 rounded-lg border border-gold-500/20"
            >
              Verificar Novamente
            </button>
            <button
              onClick={signOut}
              className="text-slate-400 hover:text-red-400 text-sm font-medium transition-colors px-4 py-2"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profile.status === 'blocked') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center border-red-500/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Acesso Bloqueado</h2>
          <p className="text-text-secondary text-sm mb-6">
            Sua conta foi temporariamente suspensa. Entre em contato com a administração.
          </p>
          <button
            onClick={signOut}
            className="text-red-400 hover:text-white text-sm font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Permission Checks
    const checkAccess = (permission: any, component: React.ReactNode) => {
      // If admin, allows everything. If not, checks permission.
      if (hasPermission(permission)) return component;

      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-text-muted">
          <Lock size={48} className="opacity-20 mb-4" />
          <p>Você não tem permissão para acessar este módulo.</p>
        </div>
      );
    };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} />;

      case 'stock':
        return checkAccess('stock', <StockForm />);

      case 'patients':
        return checkAccess('patients',
          selectedPatient ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-sm font-medium text-slate-500 hover:text-primary flex items-center gap-1"
              >
                ← Voltar para lista
              </button>
              <PatientProfile patient={selectedPatient} />
            </div>
          ) : (
            <PatientList onSelectPatient={setSelectedPatient} />
          )
        );

      case 'financial':
        return checkAccess('financial', <Financials />);

      case 'calendar':
        return checkAccess('calendar', <CalendarView />);

      case 'skin-analysis':
        return checkAccess('skin-analysis', <MvpSkinAnalysis />);

      case 'admin-users':
        return checkAccess('admin', <AdminUsers />); // Only admins have 'admin' pseudo-permission (checked in AuthContext)

      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex font-sans selection:bg-gold-500/30">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onLogout={signOut}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">

        {/* Decorative background elements for main content */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Mobile Header */}
        <div className="md:hidden bg-surface/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-surface border border-gold-500/20 rounded-lg flex items-center justify-center text-gold-400 font-serif font-bold">Q</div>
            <span className="font-serif font-bold text-text-primary">Quality</span>
          </div>
          <button onClick={() => setIsMobileSidebarOpen(true)} className="text-text-secondary hover:text-gold-400 transition-colors">
            <Menu size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent">
          <header className="mb-8 hidden md:block">
            <h1 className="text-3xl font-serif font-bold text-text-primary capitalize tracking-wide">
              {currentView === 'stock' ? 'Gestão de Estoque' :
                currentView === 'patients' ? 'Prontuário do Paciente' :
                  currentView === 'financial' ? 'Gestão Financeira' :
                    currentView === 'skin-analysis' ? 'Análise Facial IA' :
                      currentView === 'admin-users' ? 'Administração' :
                        currentView}
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-gold-500 to-transparent mt-2 rounded-full opacity-60"></div>
            <p className="text-text-secondary text-sm mt-3 font-light">
              Olá, <span className="text-gold-500">{profile?.full_name?.split(' ')[0]}</span>. Visão geral do sistema.
            </p>
          </header>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;