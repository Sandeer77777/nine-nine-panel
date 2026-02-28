import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, DollarSign, Target, Hash, Briefcase, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../services/useData';
import { Procedimento } from '../db/db';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface ProcedimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProcedimento?: Procedimento | null;
  operacaoId: number;
}

type ProcedimentoFormData = Omit<Procedimento, 'id' | 'operacaoId' | 'retorno'>;

export default function ProcedimentoModal({ isOpen, onClose, editingProcedimento, operacaoId }: ProcedimentoModalProps) {
  const { casasApostas, addProcedimento, updateProcedimento } = useData();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProcedimentoFormData>();

  useEffect(() => {
    if (isOpen) {
      if (editingProcedimento) {
        reset({
          ...editingProcedimento,
          stake: editingProcedimento.stake || 0,
          odd: editingProcedimento.odd || 0,
          lucro: editingProcedimento.lucro || 0,
        });
      } else {
        reset({
          nome: '',
          data: new Date().toISOString().split('T')[0],
          tipo: 'Qualificação',
          casa: '',
          stake: 0,
          odd: 0,
          lucro: 0,
          status: 'Pendente',
        });
      }
    }
  }, [isOpen, editingProcedimento, reset]);

  const onSubmit = async (data: ProcedimentoFormData) => {
    try {
        const procedimentoData = {
          operacaoId: editingProcedimento ? editingProcedimento.operacaoId : operacaoId,
          nome: data.nome,
          data: data.data,
          tipo: data.tipo,
          casa: data.casa,
          stake: data.stake,
          odd: data.odd,
          retorno: data.stake * data.odd,
          lucro: data.lucro,
          status: data.status,
        };

        if (editingProcedimento?.id) {
          await updateProcedimento(editingProcedimento.id, procedimentoData);
        } else {
          await addProcedimento(procedimentoData as Procedimento);
        }
        toast.success('Procedimento salvo!');
        onClose();
      } catch (error) {
        console.error("Erro ao salvar procedimento:", error);
        toast.error('Erro ao salvar.');
      }
  };

  const casasAtivas = casasApostas?.filter((casa) => casa.status !== 'inativa') || [];

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
            className="relative w-full max-w-xl bg-slate-900/90 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl flex flex-col max-h-[92vh] sm:max-h-[85vh] my-auto"
          >
            {/* Handle visual no mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-profit/10 rounded-xl border border-profit/20 text-profit">
                    <Briefcase size={24}/>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                        {editingProcedimento ? 'Editar' : 'Novo'} <span className="text-profit">Procedimento</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lançamento de fase da operação</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Procedimento</label>
                    <input 
                      {...register('nome', { required: true })} 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-profit/50 outline-none placeholder:text-slate-700 transition-all"
                      placeholder="Ex: Aposta de Qualificação" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Data do Evento</label>
                    <input 
                      type="date" 
                      {...register('data', { required: true })} 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-profit/50 outline-none text-center"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Casa de Aposta</label>
                      <div className="relative">
                        <select {...register('casa', { required: true })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white appearance-none cursor-pointer focus:border-profit/50 outline-none">
                            <option value="">Selecione a casa</option>
                            {casasAtivas.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600"/>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Ação</label>
                      <div className="relative">
                        <select {...register('tipo', { required: true })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white appearance-none cursor-pointer focus:border-profit/50 outline-none">
                            <option value="Qualificação">Qualificação 🎯</option>
                            <option value="Extração">Extração 💰</option>
                            <option value="Aposta Normal">Aposta Normal 🎲</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600"/>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-black/20 rounded-[2rem] border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-center gap-1"><DollarSign size={12}/> Stake</label>
                      <input type="number" step="0.01" {...register('stake', { valueAsNumber: true })} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-black tracking-tighter text-center focus:border-profit/50 outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-center gap-1"><Hash size={12}/> Odd</label>
                      <input type="number" step="0.01" {...register('odd', { valueAsNumber: true })} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-black tracking-tighter text-center focus:border-profit/50 outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-profit uppercase tracking-widest ml-1 flex items-center justify-center gap-1"><Target size={12}/> Lucro</label>
                      <input type="number" step="0.01" {...register('lucro', { valueAsNumber: true })} className="w-full bg-black/40 border border-profit/30 rounded-xl px-4 py-3 text-sm text-profit font-black tracking-tighter text-center focus:border-profit/50 outline-none" />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Final</label>
                  <div className="relative">
                    <select {...register('status', { required: true })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white appearance-none cursor-pointer focus:border-profit/50 outline-none">
                        <option value="Pendente">Pendente ⏳</option>
                        <option value="Ganhou">Ganhou ✅</option>
                        <option value="Perdeu">Perdeu ❌</option>
                        <option value="Reembolso">Reembolso 🔄</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600"/>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-8 py-6 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row justify-end gap-4 mt-auto">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isSubmitting} 
                  className="py-4 px-8 rounded-2xl bg-white/5 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-white transition-all order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="py-4 px-12 rounded-2xl bg-profit text-slate-900 text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:scale-[1.02] active:scale-95 transition-all order-1 sm:order-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : (editingProcedimento ? 'Salvar Alterações 🔥' : 'Confirmar Procedimento 🔥')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
