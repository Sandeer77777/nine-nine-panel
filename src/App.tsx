import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './services/useData';
import { DateFilterProvider } from './contexts/DateFilterContext'; // Importar o DateFilterProvider

// Componentes e Páginas
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Operacoes from './pages/Operacoes';
import Parcerias from './pages/Parcerias';
import Reports from './pages/Reports';
import Financeiro from './pages/Financeiro';
import Configuracoes from './pages/Configuracoes';

// Componente de Rota Protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const { loading: dataLoading } = useData();
  const [showRescue, setShowRescue] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState<string>("Validando credenciais...");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || dataLoading) {
        setShowRescue(true);
        const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
        const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
        setDebugInfo(`Erro de Link: ${hasUrl ? 'URL OK' : 'URL AUSENTE'} | ${hasKey ? 'CHAVE OK' : 'CHAVE AUSENTE'}`);
      }
    }, 12000); // 12 segundos para dar chance ao 4G
    
    if (!loading && dataLoading) setDebugInfo("Conectando ao terminal de dados...");
    if (!loading && !dataLoading) setDebugInfo("Sincronização concluída.");

    return () => clearTimeout(timer);
  }, [loading, dataLoading]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-profit/20 rounded-full animate-spin border-t-profit shadow-[0_0_20px_rgba(16,185,129,0.2)]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-profit rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-white font-black uppercase tracking-[0.3em] italic text-sm">Nine Nine <span className="text-profit">99</span></div>
          <p className="label-system !text-[9px] animate-pulse">{debugInfo}</p>
        </div>

        {showRescue && (
          <div className="animate-in fade-in zoom-in duration-700 space-y-4 max-w-xs pt-10">
            <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-[2rem] shadow-2xl">
              <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Protocolo de Emergência</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl label-system text-[9px] hover:bg-white/10 transition-all mb-3"
              >
                Forçar Reinicialização
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="w-full py-3 text-zinc-600 text-[8px] font-black uppercase tracking-widest hover:text-zinc-400 transition-colors"
              >
                Limpar Memória (Cache)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Componente que gerencia o Tema
const ThemedApp = () => {
  const { configuracoes } = useData();
  const { isAuthenticated } = useAuth();

  // Proteção: Força dark mode se as configurações ainda não carregaram ou derem erro
  const currentTheme = (configuracoes && configuracoes.length > 0) 
    ? (configuracoes.find(c => c.chave === 'tema')?.valor || 'dark') 
    : 'dark';

  return (
    <div className="dark"> {/* Forçando a classe dark na raiz para evitar flashes brancos */}
      <div className={currentTheme === 'light' ? 'light-mode' : 'dark'}>
        <GlobalErrorBoundary>
          <Router>
            <Routes>
              {/* Rota de Login */}
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <Login />
              } />

              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/operacoes" element={            
                <ProtectedRoute>
                  <Operacoes />
                </ProtectedRoute>
              } />
              
              <Route path="/parcerias" element={
                <ProtectedRoute>
                  <Parcerias />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route path="/financeiro" element={
                <ProtectedRoute>
                  <Financeiro />
                </ProtectedRoute>
              } />
              
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } />

              {/* Rota padrão para 404 ou redirecionamento */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </GlobalErrorBoundary>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}/>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <DateFilterProvider> {/* Envolver com DateFilterProvider */}
          <ThemedApp />
        </DateFilterProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;