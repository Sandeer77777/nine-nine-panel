import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CasaAposta } from '../db/db';
import { cn } from '../lib/utils';

interface CasaApostaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CasaAposta, 'id' | 'status'>) => Promise<void>;
  existingCasas: string[];
}

interface CasaApostaForm {
  nome: string;
  site?: string;
  saldo?: string;
}

export default function CasaApostaModal({ isOpen, onClose, onSave, existingCasas }: CasaApostaModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CasaApostaForm>();

  useEffect(() => {
    if (isOpen) {
      reset({
        nome: '',
        site: '',
        saldo: '0',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: CasaApostaForm) => {
    const nome = data.nome.trim().toUpperCase();
    if (existingCasas.includes(nome)) {
      alert("Casa de aposta já existe!");
      return;
    }
    
    onSave({ ...data, nome, saldo: parseFloat(data.saldo || '0') });
    onClose();
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
            className="relative w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-t-[2.5rem] sm:rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl flex flex-col my-auto"
          >
            {/* Handle visual no mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-profit/10 rounded-xl border border-profit/20 text-profit">
                  <Landmark size={24}/>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Nova <span className="text-profit">Casa de Aposta</span></h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configuração de banca tática</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-8 space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Casa</label>
                  <input
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-profit/50 outline-none uppercase font-black placeholder:text-slate-700 transition-all"
                    placeholder="Ex: BET365"
                  />
                  {errors.nome && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.nome.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Saldo Inicial</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('saldo')}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white font-black tracking-tighter focus:border-profit/50 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Link / Site (Opcional)</label>
                    <input
                      {...register('site')}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-profit/50 outline-none transition-all placeholder:text-slate-700"
                      placeholder="https://www.bet365.com"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row justify-end gap-4 mt-auto">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="py-4 px-8 rounded-2xl bg-white/5 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="py-4 px-12 rounded-2xl bg-profit text-slate-900 text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:scale-[1.02] active:scale-95 transition-all order-1 sm:order-2"
                >
                    Salvar Casa de Aposta 🔥
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
