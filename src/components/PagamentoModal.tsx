import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Parceria } from '../db';
import { cn } from '../lib/utils';

interface PagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (valor: number, data: string) => void;
  parceiro: Parceria | null;
}

export default function PagamentoModal({ isOpen, onClose, onSave, parceiro }: PagamentoModalProps) {
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isOpen) {
      setValor('');
      setData(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!parceiro) return null;

  const handleSave = () => {
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (!isNaN(valorNumerico) && valorNumerico > 0) {
      onSave(valorNumerico, data);
      onClose();
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
            className="relative w-full max-w-md bg-slate-900/90 border border-white/10 rounded-t-[2.5rem] sm:rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl flex flex-col my-auto"
          >
            {/* Handle visual no mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
                  Registrar <span className="text-profit">Pagamento</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Acerto de contas com sócio</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8">
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pagamento para:</p>
                    <p className="text-2xl font-black text-white tracking-tighter uppercase italic">{parceiro.nome}</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Pago (R$)</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-profit font-black" />
                            <input
                                type="number"
                                step="0.01"
                                autoFocus
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl text-white text-3xl font-black tracking-tighter p-5 pl-14 h-auto focus:border-profit/50 focus:bg-black/60 transition-all shadow-inner placeholder:text-slate-700"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Pagamento</label>
                         <div className="relative">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-profit" />
                            <input
                                type="date"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white focus:border-profit/50 outline-none"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-white/5 bg-black/20 flex flex-col gap-3 mt-auto">
              <button 
                onClick={handleSave} 
                className="w-full py-5 bg-profit text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Confirmar Pagamento 🔥
              </button>
              <button 
                onClick={onClose} 
                className="w-full py-4 bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
