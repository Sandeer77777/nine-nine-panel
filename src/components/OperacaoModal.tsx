import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { X, Users, CheckCircle2, Zap, Target, Trophy, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../services/useData';
import { Operacao } from '../db/db';
import { cn } from '../lib/utils';

interface OperacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingOperacao?: Operacao | null;
}

interface OperacaoForm {
  procedimento: string;
  jogo: string;
  data: string;
  horario: string;
  comissaoOperacao: number;
}

export default function OperacaoModal({ isOpen, onClose, editingOperacao }: OperacaoModalProps) {
  const { addOperacao, updateOperacao, parcerias: parceriasFromContext } = useData();
  const { register, handleSubmit, reset } = useForm<OperacaoForm>();
  
  const [availableParceiros, setAvailableParceiros] = useState<any[]>([]);
  const [selectedParceiroIds, setSelectedParceiroIds] = useState<number[]>([]);

  useEffect(() => { setAvailableParceiros(parceriasFromContext || []); }, [parceriasFromContext]);

  useEffect(() => {
    if (isOpen) {
      if (editingOperacao) {
        const dataObj = new Date(editingOperacao.dataCriacao || new Date());
        const nomePartes = (editingOperacao.nome || '').split(' - ');
        reset({
          procedimento: nomePartes[0] || '',
          jogo: nomePartes[1] || '',
          data: dataObj.toISOString().split('T')[0],
          horario: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          comissaoOperacao: editingOperacao.comissaoOperacao || 0
        });
        setSelectedParceiroIds(editingOperacao.parceiro_ids || []);
      } else {
        reset({
          procedimento: '', jogo: '',
          data: new Date().toISOString().split('T')[0],
          horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          comissaoOperacao: 25
        });
        setSelectedParceiroIds([]);
      }
    }
  }, [isOpen, editingOperacao, reset]);

  const toggleParceiroId = (id: number) => {
    setSelectedParceiroIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const onSubmit = async (data: OperacaoForm) => {
    try {
      const dataCombinada = new Date(`${data.data}T${data.horario}:00`).toISOString();
      const nomeFinal = data.jogo ? `${data.procedimento} - ${data.jogo}` : data.procedimento;
      const operacaoData: Partial<Operacao> = {
        nome: nomeFinal, estrategia: editingOperacao?.estrategia || 'Qualificação',
        dataCriacao: dataCombinada, data: dataCombinada,
        status: editingOperacao ? editingOperacao.status : 'em_andamento',
        parceiro_ids: selectedParceiroIds, comissaoOperacao: Number(data.comissaoOperacao),
        stake: editingOperacao?.stake || 0, investido: editingOperacao?.investido || 0,
        retorno: editingOperacao?.retorno || 0, lucro: editingOperacao?.lucro || 0,
        lucroPrejuizo: editingOperacao ? (editingOperacao.lucroPrejuizo || editingOperacao.lucro || 0) : 0,
        fases: editingOperacao?.fases || [],
      };
      if (editingOperacao?.id) await updateOperacao(editingOperacao.id, operacaoData);
      else await addOperacao(operacaoData);
      onClose();
    } catch (error) { console.error(error); onClose(); }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="relative w-full max-w-xl bg-[#0f172a] border border-white/10 sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col mx-auto z-10">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
              
              <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-profit/10 rounded-xl border border-profit/20 text-profit"><Target size={20} /></div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">{editingOperacao ? 'Editar' : 'Nova'} <span className="text-profit">Entrada</span></h2>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar bg-slate-900/20">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Hash size={12} className="text-indigo-500" /> Título da Operação</label>
                    <input {...register('procedimento')} placeholder="EX: ARBITRAGEM #001" className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-5 text-sm text-white outline-none focus:border-profit/50 transition-all uppercase font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Trophy size={12} className="text-profit" /> Jogo / Partida</label>
                    <input {...register('jogo')} placeholder="EX: REAL MADRID X BARCELONA" className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-5 text-sm text-white outline-none focus:border-profit/50 transition-all uppercase font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Data</label><input type="date" {...register('data')} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-xs text-white text-center focus:border-profit/50" style={{ colorScheme: 'dark' }} /></div>
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Horário</label><input type="time" {...register('horario')} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-xs text-white text-center focus:border-profit/50" style={{ colorScheme: 'dark' }} /></div>
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Repasse %</label><input type="number" step="0.1" {...register('comissaoOperacao')} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-xs text-white font-black text-center focus:border-profit/50" /></div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Users size={16} className="text-profit" /> Sócios Participantes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(availableParceiros || []).map(p => {
                      const isSelected = selectedParceiroIds.includes(p.id!); 
                      return (
                        <div key={p.id} onClick={() => toggleParceiroId(p.id!)} className={cn("cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 select-none", isSelected ? "bg-profit/10 border-profit/40" : "bg-white/[0.02] border-white/5 text-slate-500")}>
                          <div className={cn("w-5 h-5 rounded-md flex items-center justify-center border transition-all", isSelected ? "bg-profit border-profit text-slate-900" : "border-slate-700 text-transparent")}><CheckCircle2 size={12} strokeWidth={4} /></div>
                          <span className={cn("text-[10px] font-black uppercase truncate", isSelected ? "text-white" : "text-slate-500")}>{p.nome}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-white/5 bg-black/40 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] h-12 rounded-xl bg-profit text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">Confirmar Operação 🔥</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.getElementById('modal-root')!);
}
