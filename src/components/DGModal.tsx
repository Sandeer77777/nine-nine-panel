import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Rocket, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../services/useData';
import { Operacao } from '../db/db';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface DGModalProps {
  isOpen: boolean;
  onClose: () => void;
  operacao: Operacao;
}

interface DGForm {
  lucroDG: number;
  repassarComissaoDG: boolean;
}

export default function DGModal({ isOpen, onClose, operacao }: DGModalProps) {
  const { updateOperacao } = useData();
  const { register, handleSubmit, reset } = useForm<DGForm>();

  useEffect(() => {
    if (isOpen) {
      reset({
        lucroDG: operacao.lucroDG || 0,
        repassarComissaoDG: operacao.repassarComissaoDG ?? true
      });
    }
  }, [isOpen, operacao, reset]);

  const onSubmit = async (data: DGForm) => {
    try {
      await updateOperacao(operacao.id!, {
        isDG: true,
        lucroDG: Number(data.lucroDG),
        repassarComissaoDG: data.repassarComissaoDG,
        dataAtualizacao: new Date().toISOString()
      });
      toast.success("Evento Duplo Green (DG) registrado!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar DG.");
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
            className="relative w-full max-w-sm bg-slate-900/90 border border-profit/30 rounded-t-[2.5rem] sm:rounded-3xl shadow-[0_0_80px_rgba(255,255,255,0.05)] overflow-hidden backdrop-blur-xl flex flex-col my-auto"
          >
            {/* Handle visual no mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 py-5 border-b border-white/5 bg-profit/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-profit/10 text-profit">
                      <Rocket className="animate-pulse" size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white uppercase tracking-tighter italic">Evento <span className="text-profit">DG</span></h2>
                      <p className="label-system !text-[8px] !tracking-widest">Duplo Green Detectado</p>
                    </div>
                </div>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-6 text-center">
                    <div className="space-y-3">
                        <p className="label-system text-zinc-500">Lucro Extra Identificado</p>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-profit font-black text-xl tracking-tighter opacity-50">R$</span>
                            <input 
                                autoFocus
                                type="number" 
                                step="0.01" 
                                {...register('lucroDG')} 
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-12 pr-4 text-3xl text-white font-black tracking-tighter text-center outline-none focus:border-profit transition-all shadow-inner" 
                                placeholder="0.00" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-profit/20 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500 group-hover:text-profit transition-colors">
                              <Users size={16} />
                            </div>
                            <span className="label-system !text-zinc-400">Repassar Sócios?</span>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" {...register('repassarComissaoDG')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-profit"></div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-white/5 bg-black/20 flex flex-col gap-3">
                <button type="submit" className="w-full py-4 btn-insane-green text-black rounded-2xl label-system !text-black shadow-xl shadow-profit/20 hover:scale-[1.02] active:scale-95 transition-all">
                    Liquidar Duplo Green 🔥
                </button>
                <button type="button" onClick={onClose} className="w-full py-3 bg-white/5 text-zinc-500 rounded-2xl label-system hover:text-white transition-colors">
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
