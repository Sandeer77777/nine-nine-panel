import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[200px] w-full flex flex-col items-center justify-center p-8 tactical-card border-red-500/20 bg-red-500/5 text-center space-y-4">
          <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="label-system text-white">Radar Off-line</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Falha crítica no processamento deste módulo</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <RefreshCcw size={14} /> Reiniciar Módulo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
