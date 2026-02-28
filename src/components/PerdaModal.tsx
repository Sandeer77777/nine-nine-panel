import React from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { cn } from '../lib/utils';

interface PerdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  operacaoId: string;
}

interface PerdaForm {
  valor: number;
  descricao: string;
}

export default function PerdaModal({ isOpen, onClose, operacaoId }: PerdaModalProps) {
  const { addOperacaoPerda, fullReload } = useData();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PerdaForm>();

  const onSubmit = (data: PerdaForm) => {
    addOperacaoPerda({
      operacaoId: parseInt(operacaoId, 10),
      valor: data.valor,
      descricao: data.descricao,
    });
    reset();
    onClose();
    fullReload();
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
            className="relative w-full max-w-md bg-slate-900/90 border border-red-500/30 rounded-t-[2.5rem] sm:rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.15)] overflow-hidden backdrop-blur-xl flex flex-col my-auto"
          >
            {/* Handle visual no mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 bg-red-500/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Registrar <span className="text-red-400">Perda / Erro</span></h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lançamento de déficit tático</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor da Perda (R$)</label>
                  <div className="relative group">
                    <input
                      {...register('valor', {
                        required: 'Valor é obrigatório',
                        min: { value: 0.01, message: 'O valor da perda deve ser positivo' },
                        valueAsNumber: true,
                      })}
                      type="number"
                      step="0.01"
                      autoFocus
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-3xl font-black text-white tracking-tighter focus:border-red-500/50 transition-all shadow-inner placeholder:text-slate-700"
                      placeholder="0.00"
                    />
                    {errors.valor && (
                      <p className="mt-2 text-[10px] font-black text-red-400 uppercase tracking-widest text-center">{errors.valor.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição (Motivo)</label>
                  <textarea
                    {...register('descricao', { required: 'Descrição é obrigatória' })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-red-500/50 outline-none placeholder:text-slate-700 transition-all min-h-[120px]"
                    placeholder="Ex: Erro de cobertura, Odd alterada, etc."
                  ></textarea>
                  {errors.descricao && (
                    <p className="mt-2 text-[10px] font-black text-red-400 uppercase tracking-widest text-center">{errors.descricao.message}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  className="w-full py-5 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Confirmar Perda 🔥
                </button>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="w-full py-4 bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
