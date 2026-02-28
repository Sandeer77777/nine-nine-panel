import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, FolderX, Search, Clock, CheckCircle2, Gift, Target, TrendingUp, ListFilter, Users, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useData } from '../services/useData';
import OperacaoModal from '../components/OperacaoModal';
import DGModal from '../components/DGModal';
import AddFaseModal from '../components/AddFaseModal';
import OperacaoCard from '../components/OperacaoCard';
import { Operacao } from '../db/db';
import { useDateFilter } from '../contexts/DateFilterContext';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { parseISO, isWithinInterval } from 'date-fns';
import { calculateDetailedMetrics, safeNum } from '../utils/calculations';
import { cn } from '../lib/utils';

const cleanMoney = (val: any): number => safeNum(val);

const StatMiniCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="glass-panel px-2 py-1.5 rounded-lg flex flex-col items-center justify-center text-center gap-0.5 gpu-accelerated hover:bg-white/5 transition-colors border border-white/5 w-full">
        <div className={cn("p-1 rounded shrink-0 mb-0.5", color)}>
            <Icon size={10} />
        </div>
        <div className="min-w-0 w-full">
            <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest leading-none">{title}</p>
            <p className="text-[10px] font-black text-white leading-tight mt-0.5 tracking-tighter truncate">{value}</p>
        </div>
    </div>
);

export default function Operacoes() {
  const { operacoes, updateOperacao, deleteOperacao, addTransacao } = useData();
  const { startDate, endDate, setStartDate, setEndDate } = useDateFilter();

  const [filter, setFilter] = useState<'todos' | 'andamento' | 'freebet' | 'finalizadas'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOperacaoModalOpen, setIsOperacaoModalOpen] = useState(false);
  const [isDGModalOpen, setIsDGModalOpen] = useState(false);
  
  const [currentOperacaoId, setCurrentOperacaoId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'qualificacao' | 'extracao' | 'freebet' | 'reembolso' | 'rainbow'>('qualificacao');
  const [editingOperacao, setEditingOperacao] = useState<Operacao | null>(null);
  const [selectedOpForDG, setSelectedOpForDG] = useState<Operacao | null>(null);
  const [faseParaEditar, setFaseParaEditar] = useState<any>(null);
  const [faseIndexEditing, setFaseIndexEditing] = useState<number | undefined>(undefined);

  const handleUpdateStatus = async (operacaoId: number, newStatus: string) => {
    const op = (operacoes || []).find(o => o.id === operacaoId);
    if (!op) return;
    const fases = op.fases || [];
    let lT = 0, iT = 0, rT = 0;
    fases.forEach((f: any) => {
        let l = cleanMoney(f.lucro) || cleanMoney(f.lucroPrejuizo);
        let i = cleanMoney(f.valorInvestido) || cleanMoney(f.stake);
        lT += l; iT += i; rT += (i + l);
    });
    try { await updateOperacao(operacaoId, { ...op, status: newStatus, lucro: lT, investido: iT, retorno: rT }); } catch (error) { console.error(error); }
  };

  const handleSaveFase = async (entradas: any[], resumo: any) => {
    if (!currentOperacaoId) return;
    const opId = Number(currentOperacaoId);
    const op = (operacoes || []).find(o => o.id === opId);
    if (!op) return;
    const estFinal = entradas[0]?.nome || 'qualificacao';
    const novasFases = [...(op.fases || [])];
    const nF = { id: nanoid(), nome: estFinal.toUpperCase(), data: new Date().toISOString(), entradas, lucro: resumo.lucro, investido: resumo.investido, retorno: resumo.retorno, status: 'Pendente' };
    if (faseIndexEditing !== undefined) novasFases[faseIndexEditing] = nF; else novasFases.push(nF);
    const tI = novasFases.reduce((s, f) => s + (f.investido || 0), 0);
    const tR = novasFases.reduce((s, f) => s + (f.retorno || 0), 0);
    const tL = novasFases.reduce((s, f) => s + (f.lucro || 0), 0);
    try { await updateOperacao(opId, { ...op, estrategia: estFinal, fases: novasFases, investido: tI, retorno: tR, lucro: tL }); setIsModalOpen(false); } catch (error) { console.error(error); }
  };

  const operacoesFiltradas = useMemo(() => {
    const start = parseISO(startDate + 'T00:00:00'); const end = parseISO(endDate + 'T23:59:59');
    let ops = (operacoes || []).filter(op => op.data && isWithinInterval(parseISO(op.data), { start, end }));
    if (searchTerm) { const term = searchTerm.toLowerCase(); ops = ops.filter(op => op.nome.toLowerCase().includes(term) || op.estrategia?.toLowerCase().includes(term)); }
    if (filter === 'andamento') ops = ops.filter(op => op.status === 'em_andamento' || !op.status);
    else if (filter === 'finalizadas') ops = ops.filter(op => op.status === 'concluido' || op.status === 'finalizada');
    else if (filter === 'freebet') ops = ops.filter(op => op.status === 'aguardando_freebet' || op.estrategia?.toLowerCase().includes('freebet') || op.estrategia?.toLowerCase().includes('rainbow'));
    return ops.sort((a,b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  }, [operacoes, searchTerm, filter, startDate, endDate]);

  const stats = useMemo(() => {
    const metrics = calculateDetailedMetrics(operacoesFiltradas, 0);
    return { lucro: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.lucroRealizado), roi: metrics.roi };
  }, [operacoesFiltradas]);

  return (
    <>
      <div className="space-y-3 sm:space-y-5 pb-20">
        {/* TOPO: TÍTULO E NOVA ENTRADA (LADO A LADO NO MOBILE) */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Operações <span className="text-profit">Tactical</span></h1>
              <p className="text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Gestão de Entradas</p>
          </div>
          <button onClick={() => { setEditingOperacao(null); setIsOperacaoModalOpen(true); }} className="h-8 sm:h-9 px-4 btn-insane-green rounded-lg shadow-xl active:scale-95 flex items-center justify-center gap-2 shrink-0">
            <Plus size={14} strokeWidth={4} />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Nova Entrada</span>
          </button>
        </div>

        {/* STATS: SEGUNDO BLOCO IMPORTANTE */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          <StatMiniCard title="Ativas" value={operacoesFiltradas.filter(o => o.status === 'em_andamento').length} icon={Clock} color="bg-sky-500/10 text-sky-400" />
          <StatMiniCard title="Free bets" value={operacoesFiltradas.filter(o => o.status === 'aguardando_freebet').length} icon={Gift} color="bg-amber-500/10 text-amber-400" />
          <StatMiniCard title="Lucro" value={stats.lucro} icon={Target} color="bg-profit/10 text-profit" />
          <StatMiniCard title="ROI Médio" value={`${stats.roi}%`} icon={TrendingUp} color="bg-indigo-500/10 text-indigo-400" />
        </div>

        {/* FERRAMENTAS: BUSCA E DATA EM LINHA ÚNICA */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full sm:w-auto"><DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} /></div>
            <div className="relative w-full flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-600" />
                <input 
                    type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="FILTRAR POR NOME OU ESTRATÉGIA..." 
                    className="h-8 w-full bg-slate-900/50 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] text-white text-center outline-none focus:border-profit/30 transition-all placeholder-slate-700" 
                />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"><X size={10} /></button>}
            </div>
        </div>

        {/* ABAS: NAVEGAÇÃO CENTRALIZADA (SEM STICKY) */}
        <div className="flex justify-center w-full py-2">
            <div className="glass-panel p-1 rounded-xl border border-white/5 flex items-center gap-1 bg-slate-950/40 backdrop-blur-xl shadow-2xl">
            {[
                { id: 'todos', label: 'Tudo', icon: ListFilter, count: (operacoes || []).length },
                { id: 'andamento', label: 'Ativas', icon: Clock, count: (operacoes || []).filter(o => o.status === 'em_andamento' || !o.status).length },
                { id: 'freebet', label: 'Freebet', icon: Gift, count: (operacoes || []).filter(o => o.status === 'aguardando_freebet' || o.estrategia?.toLowerCase().includes('freebet') || o.estrategia?.toLowerCase().includes('rainbow')).length },
                { id: 'finalizadas', label: 'Pagas', icon: CheckCircle2, count: (operacoes || []).filter(o => o.status === 'concluido' || o.status === 'finalizada').length }
            ].map((tab) => {
                const isActive = filter === tab.id;
                return (
                    <button key={tab.id} onClick={() => setFilter(tab.id as any)} className={cn("flex items-center justify-center gap-1.5 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-md transition-all whitespace-nowrap min-w-[70px]", isActive ? "bg-profit text-slate-950 shadow-md" : "text-zinc-500 hover:text-zinc-200")}>
                        <tab.icon size={10} strokeWidth={isActive ? 3 : 2} />
                        <span>{tab.label}</span>
                        {tab.count > 0 && <span className={cn("ml-0.5 px-1 rounded-[2px] text-[7px] font-black", isActive ? "bg-slate-950/20 text-slate-900" : "bg-slate-800 text-slate-500")}>{tab.count}</span>}
                    </button>
                );
            })}
            </div>
        </div>

        {/* LISTA DE OPERAÇÕES */}
        <div className="space-y-1">
            {operacoesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 bg-slate-900/20 rounded-xl border border-dashed border-slate-800"><FolderX size={24} className="mb-2 text-slate-700" /><h2 className="text-[10px] font-bold text-slate-500 uppercase">Nenhuma operação encontrada</h2></div>
            ) : (
              operacoesFiltradas.map(op => (
                  <OperacaoCard key={op.id} operacao={op} onDelete={(id) => deleteOperacao(Number(id))} onEdit={(op) => { setEditingOperacao(op); setIsOperacaoModalOpen(true); }}
                      onAddQualificacao={(id) => { setCurrentOperacaoId(String(id)); setModalMode('qualificacao'); setIsModalOpen(true); }}
                      onEditFase={(opId, fase, idx) => { setCurrentOperacaoId(String(opId)); setFaseParaEditar(fase); setFaseIndexEditing(idx); setModalMode(fase.nome.toLowerCase() as any); setIsModalOpen(true); }}
                      onUpdateStatus={handleUpdateStatus} onOpenDG={(op) => { setSelectedOpForDG(op); setIsDGModalOpen(true); }}
                  />
              ))
            )}
        </div>
      </div>

      <OperacaoModal isOpen={isOperacaoModalOpen} onClose={() => { setIsOperacaoModalOpen(false); setEditingOperacao(null); }} editingOperacao={editingOperacao} />
      {isDGModalOpen && selectedOpForDG && <DGModal isOpen={isDGModalOpen} onClose={() => { setIsDGModalOpen(false); setSelectedOpForDG(null); }} operacao={selectedOpForDG} />}
      <AddFaseModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setFaseParaEditar(null); setFaseIndexEditing(undefined); }} onSave={handleSaveFase} estrategiaOperacao={modalMode} faseParaEditar={faseParaEditar} faseIndex={faseIndexEditing} />
    </>
  );
}
