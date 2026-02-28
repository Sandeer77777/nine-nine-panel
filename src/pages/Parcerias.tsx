import React, { useState, useMemo } from 'react';
import { useData } from '../services/useData';
import { Plus, Trash2, Edit, DollarSign, Users, TrendingUp, Wallet, CheckCircle2 } from 'lucide-react';
import { Parceria } from '../db/db';
import ParceriaModal from '../components/ParceriaModal';
import PagamentoModal from '../components/PagamentoModal';
import { useDateFilter } from '../contexts/DateFilterContext';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { parseISO, isWithinInterval } from 'date-fns';
import { cn } from '../lib/utils';

const safeNum = (val: any) => {
  if (typeof val === 'string') return parseFloat(val.replace(',', '.')) || 0;
  return Number(val) || 0;
};

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// --- MINI CARD UNIFICADO ---
const StatMiniCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="glass-panel px-3 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 gpu-accelerated hover:bg-white/5 transition-colors border border-white/5 w-full">
        <div className={cn("p-1.5 rounded-lg shrink-0 mb-0.5", color)}>
            <Icon size={12} />
        </div>
        <div className="min-w-0 w-full">
            <p className="text-[6px] sm:text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] leading-none mb-1">{title}</p>
            <p className="text-xs sm:text-base font-black text-white leading-tight tracking-tighter truncate">{value}</p>
        </div>
    </div>
);

const Parcerias = () => {
  const { parcerias, transacoes, deleteParceiro, addTransacao } = useData();
  const { startDate, endDate, setStartDate, setEndDate } = useDateFilter();

  const [isParceriaModalOpen, setIsParceriaModalOpen] = useState(false);
  const [editingParceiro, setEditingParceiro] = useState<Parceria | null>(null);
  const [pagamentoModal, setPagamentoModal] = useState<{ isOpen: boolean; parceiro: Parceria | null }>({ isOpen: false, parceiro: null });

  const parceirosComDados = useMemo(() => {
    const listaParceiros = parcerias || [];
    const listaTrans = transacoes || [];
    const start = startDate ? parseISO(startDate + 'T00:00:00') : new Date('2020-01-01');
    const end = endDate ? parseISO(endDate + 'T23:59:59') : new Date('2030-12-31');

    return listaParceiros.map(parceiro => {
      const transacoesDoParceiro = listaTrans.filter(t => {
        if (t.responsavel !== parceiro.nome) return false;
        if (!t.data) return false;
        return isWithinInterval(parseISO(t.data), { start, end });
      });
      const comissaoGerada = transacoesDoParceiro.filter(t => t.categoria === 'Comissão' || (t.descricao && t.descricao.includes('Comissão'))).reduce((acc, t) => t.tipo === 'receita' ? acc + safeNum(t.valor) : acc - safeNum(t.valor), 0);
      const totalPago = transacoesDoParceiro.filter(t => t.categoria === 'Pagamento' || t.tipo === 'pagamento').reduce((acc, t) => acc + safeNum(t.valor), 0);
      return { ...parceiro, opsCount: transacoesDoParceiro.filter(t => t.categoria === 'Comissão').length, comissaoGerada, totalPago, aPagar: comissaoGerada - totalPago };
    });
  }, [parcerias, transacoes, startDate, endDate]);

  const handleSavePagamento = async (valor: number, data: string) => {
    const parceiro = pagamentoModal.parceiro; if (!parceiro) return;
    await addTransacao({ data, valor, tipo: 'pagamento', categoria: 'Pagamento', descricao: `Pagamento: ${parceiro.nome}`, responsavel: parceiro.nome, status: 'consolidado' });
    setPagamentoModal({ isOpen: false, parceiro: null });
  };

  if (!parcerias) return <div className="p-10"><StatMiniCard title="SÓCIOS" value="CARREGANDO..." icon={Users} color="bg-white/5" /></div>;

  return (
    <div className="space-y-4 sm:space-y-5 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER COMPACTO */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Gestão de <span className="text-profit">Sócios</span></h1>
            <p className="text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Controle de Repasses e Operadores</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
            <button onClick={() => { setEditingParceiro(null); setIsParceriaModalOpen(true); }} className="h-9 px-6 btn-insane-green rounded-xl shadow-xl active:scale-95 border border-profit/30 flex items-center justify-center gap-2 w-full sm:w-auto"><Plus size={16} strokeWidth={4} /><span className="text-[9px] font-black uppercase tracking-widest">Novo Parceiro</span></button>
        </div>
      </div>

      {/* STATS DE PARCERIA (ELITE 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatMiniCard title="Total Sócios" value={parcerias.length} icon={Users} color="bg-indigo-500/10 text-indigo-400" />
        <StatMiniCard title="Comissões" value={formatCurrency(parceirosComDados.reduce((acc, p) => acc + p.comissaoGerada, 0))} icon={TrendingUp} color="bg-profit/10 text-profit" />
        <StatMiniCard title="Liquidado" value={formatCurrency(parceirosComDados.reduce((acc, p) => acc + p.totalPago, 0))} icon={CheckCircle2} color="bg-sky-500/10 text-sky-400" />
        <StatMiniCard title="Pendência" value={formatCurrency(parceirosComDados.reduce((acc, p) => acc + p.aPagar, 0))} icon={Wallet} color="bg-amber-500/10 text-amber-400" />
      </div>

      {/* TABELA DE SÓCIOS SLIM */}
      <div className="glass-panel p-0 overflow-hidden border border-white/5 rounded-xl shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-black/40 border-b border-white/5">
              <tr>
                <th className="px-4 py-2.5 text-[7px] font-black text-zinc-500 uppercase tracking-widest">Sócio / Operador</th>
                <th className="px-4 py-2.5 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-center">Volume</th>
                <th className="px-4 py-2.5 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-right">A Pagar</th>
                <th className="px-4 py-2.5 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parceirosComDados.map((parceiro) => (
                <tr key={parceiro.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-zinc-800 to-black border border-white/5 flex items-center justify-center text-profit font-black text-[10px] uppercase shadow-inner">
                        {parceiro.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-[11px] text-white uppercase tracking-tight truncate">{parceiro.nome}</p>
                        <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest truncate">{parceiro.contato || 'Sem contato'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-4 py-2">
                    <span className="px-2 py-0.5 text-[8px] font-black rounded bg-black border border-white/5 text-zinc-500 group-hover:text-profit transition-all">{parceiro.opsCount} OPS</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className={cn("font-black font-mono text-[11px] tracking-tighter", parceiro.aPagar > 0 ? "text-profit text-glow-profit" : "text-zinc-700")}>
                      {formatCurrency(parceiro.aPagar)}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setPagamentoModal({ isOpen: true, parceiro })} className="p-1.5 text-profit hover:bg-profit/10 rounded-lg transition-all active:scale-90" title="Liquidar"><DollarSign size={14} /></button>
                      <button onClick={() => { setEditingParceiro(parceiro); setIsParceriaModalOpen(true); }} className="p-1.5 text-zinc-600 hover:text-white rounded-lg transition-all active:scale-90"><Edit size={14} /></button>
                      <button onClick={() => { if(confirm('Excluir Sócio?')) deleteParceiro(parceiro.id!); }} className="p-1.5 text-red-500/40 hover:text-red-500 rounded-lg transition-all active:scale-90"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {parceirosComDados.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-[8px] font-black text-zinc-800 uppercase tracking-widest italic">Nenhum parceiro encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isParceriaModalOpen && <ParceriaModal isOpen={isParceriaModalOpen} onClose={() => setIsParceriaModalOpen(false)} editingParceiro={editingParceiro} />}
      {pagamentoModal.isOpen && <PagamentoModal isOpen={pagamentoModal.isOpen} onClose={() => setPagamentoModal({ isOpen: false, parceiro: null })} onSave={handleSavePagamento} parceiro={pagamentoModal.parceiro} />}
    </div>
  );
};

export default Parcerias;
