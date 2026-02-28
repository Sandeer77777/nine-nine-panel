import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

interface SelectiveResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SelectiveResetModal({ isOpen, onClose }: SelectiveResetModalProps) {
  const { selectiveResetData } = useData(); 

  const [clearFinancialMovements, setClearFinancialMovements] = useState(true);
  const [clearRegistrations, setClearRegistrations] = useState(false);

  const handleExecuteReset = () => {
    const tablesToClear = {
      operacoes: clearFinancialMovements,
      transacoes: clearFinancialMovements,
      operacaoPerdas: clearFinancialMovements,
      parcerias: clearRegistrations,
      casasApostas: clearRegistrations,
    };

    if (!Object.values(tablesToClear).some(v => v)) {
      toast.error('Selecione pelo menos uma opção para limpar.');
      return;
    }

    if (window.confirm('Tem certeza que deseja executar a limpeza? Esta ação pode ser irreversível para os dados selecionados.')) {
      selectiveResetData(tablesToClear);
      onClose();
      toast.success('Limpeza executada. A página será recarregada.');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-slate-900/90 border border-yellow-500/30 rounded-t-[2.5rem] sm:rounded-3xl shadow-[0_0_80px_rgba(234,179,8,0.15)] overflow-hidden backdrop-blur-xl flex flex-col my-auto"
          >
            {/* Handle visual no mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 bg-yellow-500/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Reset <span className="text-yellow-400">Seletivo</span></h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Limpeza controlada de dados</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-start gap-4 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-400/80 text-[11px] font-bold uppercase tracking-wider leading-relaxed">
                  Esta ação é IRREVERSÍVEL. Certifique-se das opções marcadas antes de prosseguir com a execução tática.
                </p>
              </div>

              <div className="space-y-4">
                <label 
                  onClick={() => setClearFinancialMovements(!clearFinancialMovements)}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer",
                    clearFinancialMovements ? "bg-white/5 border-white/20" : "bg-black/20 border-white/5 opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-1",
                    clearFinancialMovements ? "bg-yellow-500 border-yellow-500 text-slate-900" : "border-slate-800 text-transparent"
                  )}>
                    <X size={14} strokeWidth={4} />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Limpar Financeiro</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                      Zera operações, transações e histórico. Mantém parceiros e casas.
                    </p>
                  </div>
                </label>

                <label 
                  onClick={() => setClearRegistrations(!clearRegistrations)}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer",
                    clearRegistrations ? "bg-red-500/10 border-red-500/30" : "bg-black/20 border-white/5 opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-1",
                    clearRegistrations ? "bg-red-500 border-red-500 text-white" : "border-slate-800 text-transparent"
                  )}>
                    <X size={14} strokeWidth={4} />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black text-red-400 uppercase tracking-widest">Apagar Cadastros</span>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                      Apaga sócios e casas de aposta. Altamente perigoso!
                    </p>
                  </div>
                </label>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                <button
                  onClick={handleExecuteReset}
                  className="w-full py-5 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-yellow-900/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>Executar Limpeza 🔥</span>
                </button>
                <button 
                  onClick={onClose} 
                  className="w-full py-4 bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
