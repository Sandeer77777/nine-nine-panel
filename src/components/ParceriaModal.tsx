import React, { useEffect, useState } from 'react';
import { X, Save, History, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Parceria } from '../db/db';
import { useData } from '../services/useData';
import { cn } from '../lib/utils';

interface ParceriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingParceiro: Parceria | null;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const ParceriaModal: React.FC<ParceriaModalProps> = ({ isOpen, onClose, editingParceiro }) => {
  const { addParceiro, transacoes } = useData(); 
  
  const [formData, setFormData] = useState<{
    nome: string;
    contato: string;
    chavePix: string;
    porcentagem: number;
    ativo: boolean;
  }>({
    nome: '',
    contato: '',
    chavePix: '',
    porcentagem: 0,
    ativo: true
  });

  const [extrato, setExtrato] = useState<any[]>([]);

  useEffect(() => {
    if (editingParceiro) {
      setFormData({
        nome: editingParceiro.nome || '',
        contato: editingParceiro.contato || '',
        chavePix: editingParceiro.chavePix || editingParceiro.chave_pix || '', 
        porcentagem: Number(editingParceiro.porcentagem || 0),
        ativo: editingParceiro.ativo !== false
      });

      if (transacoes) {
        const movs = transacoes
          .filter(t => t.responsavel === editingParceiro.nome)
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        setExtrato(movs);
      }
    } else {
      setFormData({ nome: '', contato: '', chavePix: '', porcentagem: 0, ativo: true });
      setExtrato([]);
    }
  }, [editingParceiro, transacoes, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;
    
    const payload = {
        nome: formData.nome,
        contato: formData.contato,
        chave_pix: formData.chavePix, 
        porcentagem: formData.porcentagem,
        ativo: formData.ativo
    };

    try {
        if (!editingParceiro) {
            await addParceiro(payload);
        }
        onClose();
    } catch (error) {
        console.error("Erro ao salvar parceiro:", error);
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
            className="relative w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-t-[2.5rem] sm:rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl flex flex-col max-h-[90vh] my-auto"
          >
            {/* Handle visual no mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
                   {editingParceiro ? 'Detalhes do' : 'Novo'} <span className="text-profit">Parceiro</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gestão de sócios e repasses</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto no-scrollbar space-y-8">
                <form id="parceiro-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input 
                            type="text" 
                            required
                            disabled={!!editingParceiro} 
                            value={formData.nome}
                            onChange={e => setFormData({...formData, nome: e.target.value})}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-profit/50 outline-none disabled:opacity-30 placeholder:text-slate-700"
                            placeholder="Ex: João Silva"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave PIX</label>
                        <input 
                            type="text" 
                            value={formData.chavePix}
                            onChange={e => setFormData({...formData, chavePix: e.target.value})}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-profit/50 outline-none placeholder:text-slate-700 font-mono"
                            placeholder="CPF, Email, Celular..."
                        />
                    </div>
                </form>

                {/* EXTRATO FINANCEIRO */}
                {editingParceiro && (
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <History size={16} className="text-profit" />
                            Histórico de Movimentações
                        </h3>
                        
                        <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                            {extrato.length === 0 ? (
                                <div className="p-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">Nenhuma movimentação encontrada.</div>
                            ) : (
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Data</th>
                                                <th className="px-6 py-4 text-left">Descrição</th>
                                                <th className="px-6 py-4 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {extrato.map((t) => (
                                                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4 text-slate-500 text-[10px] font-black">
                                                        {new Date(t.data).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="px-6 py-4 text-white font-medium text-xs">
                                                        {t.descricao}
                                                    </td>
                                                    <td className={cn(
                                                        "px-6 py-4 text-right font-black tracking-tighter text-sm",
                                                        t.tipo === 'receita' ? 'text-profit' : 'text-red-400'
                                                    )}>
                                                        <div className="flex items-center justify-end gap-2">
                                                            {t.tipo === 'receita' ? <ArrowUpCircle size={14}/> : <ArrowDownCircle size={14}/>}
                                                            {formatCurrency(Number(t.valor))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-white/5 flex justify-end gap-4 bg-black/20 mt-auto">
              <button 
                onClick={onClose} 
                className="py-4 px-8 rounded-2xl bg-white/5 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
              >
                Fechar
              </button>
              {!editingParceiro && (
                <button 
                  form="parceiro-form" 
                  type="submit" 
                  className="py-4 px-10 bg-profit text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                    <Save size={18} />
                    Salvar Parceiro
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ParceriaModal;