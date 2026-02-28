import React, { useState, useMemo } from 'react';
import { useData } from '../services/useData';
import { getNetProfit } from '../utils/calculations';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { 
  Trash2, SquarePen, Gift, Plus, CheckCircle2, 
  RefreshCcw, Copy, Calendar, Users, Target, Rocket, PlusCircle
} from 'lucide-react';

interface OperacaoCardProps {
  operacao: any; onDelete?: (id: string) => void; onEdit?: (operacao: any) => void;
  onAddExtracao?: (id: string) => void; onAddQualificacao?: (id: string) => void;
  onEditFase?: (opId: string, faseData: any, faseIndex: number) => void;
  onDeleteFase?: (opId: string, faseIndex: number) => void;
  onUpdateStatus?: (id: number, status: string) => void;
  onOpenDG?: (operacao: any) => void;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export const OperacaoCard: React.FC<OperacaoCardProps> = ({ 
  operacao, onDelete, onEdit, onAddExtracao, onAddQualificacao, onEditFase, onDeleteFase, onUpdateStatus, onOpenDG
}) => {
  const { parcerias, duplicateOperation } = useData();
  const [isExpanded, setIsExpanded] = useState(false);

  const nomesParceiros = useMemo(() => {
    if (!operacao.parceiro_ids || !Array.isArray(operacao.parceiro_ids) || !parcerias) return 'Sem parceiros';
    return operacao.parceiro_ids.map((id: number) => parcerias.find(p => p.id === id)?.nome).filter(Boolean).join(', ') || 'Sem parceiros';
  }, [operacao.parceiro_ids, parcerias]);

  const status = (operacao.status || 'em_andamento').toLowerCase();
  const isConcluido = status === 'concluido' || status === 'finalizada';

  const lucro = useMemo(() => {
    if (operacao.isDG) {
        const valorDG = Number(operacao.lucroDG || 0);
        const comissaoPerc = Number(operacao.comissaoOperacao || 0);
        return operacao.repassarComissaoDG ? valorDG * (1 - comissaoPerc / 100) : valorDG;
    }
    return getNetProfit(operacao);
  }, [operacao]);

  return (
    <div className={cn(
        "tactical-card p-0 overflow-hidden mb-1.5 group/card shadow-xl transition-all duration-500",
        isExpanded ? "border-profit/40 bg-slate-950/40" : "hover:border-zinc-700 bg-[#0E0E10]",
        lucro < 0 && isConcluido ? "border-red-500/20" : ""
    )}>
      <div className="p-3 sm:p-3 cursor-pointer active:bg-white/[0.01]" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* LADO ESQUERDO / TOPO: INFO PRINCIPAL */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2">
                {operacao.isDG && <div className="bg-profit px-1 py-0.5 rounded text-[6px] font-black text-black uppercase italic shrink-0">DG</div>}
                <h3 className="font-black text-xs text-white uppercase truncate group-hover/card:text-profit">{operacao.nome}</h3>
                <span className="text-[7px] font-black text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
                    {operacao.estrategia === 'freebet' ? 'Free bet' : operacao.estrategia}
                </span>
                {/* Status no mobile aparece aqui ao lado do nome */}
                <div className={cn("sm:hidden px-1.5 py-0.5 rounded text-[6px] font-black uppercase border shrink-0", isConcluido ? "bg-profit/5 text-profit border-profit/20" : "bg-sky-500/5 text-sky-400 border-sky-500/20")}>
                    {status.replace('_', ' ')}
                </div>
            </div>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                <div className="flex items-center gap-1.5"><span className="text-[7px] font-black text-zinc-600 uppercase">Res:</span><span className={cn("text-xs font-black font-mono leading-none", lucro > 0 ? "text-profit text-glow-profit" : lucro < 0 ? "text-red-500" : "text-zinc-500")}>{lucro > 0 ? '+' : ''}{formatCurrency(lucro)}</span></div>
                <div className="h-3 w-px bg-white/5 hidden sm:block"></div>
                <div className="flex items-center gap-1"><Calendar size={8} className="text-zinc-600"/><span className="text-[7px] font-black text-zinc-600 uppercase">{new Date(operacao.dataCriacao).toLocaleDateString('pt-BR')}</span></div>
                <div className="flex items-center gap-1"><Users size={8} className="text-zinc-600" /><span className="text-[7px] font-black text-zinc-600 uppercase truncate max-w-[100px]">{nomesParceiros}</span></div>
            </div>
          </div>

          {/* LADO DIREITO / BAIXO: AÇÕES E STATUS DESKTOP */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5" onClick={e => e.stopPropagation()}>
            <div className={cn("hidden sm:block px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest border", isConcluido ? "bg-profit/5 text-profit border-profit/20" : "bg-sky-500/5 text-sky-400 border-sky-500/20")}>{status.replace('_', ' ')}</div>
            
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 gap-1 shadow-inner">
                <button onClick={() => onOpenDG?.(operacao)} className={cn("p-1.5 rounded transition-all", operacao.isDG ? "text-profit bg-profit/10" : "text-zinc-600 hover:text-profit")}><Rocket size={15} className={cn(operacao.isDG ? "animate-rocket-snake" : "")}/></button>
                <button onClick={() => onEdit?.(operacao)} className="p-1.5 rounded text-zinc-600 hover:text-white transition-colors"><SquarePen size={15} /></button>
                <button onClick={() => onDelete?.(operacao.id)} className="p-1.5 rounded text-red-500/40 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
            </div>
            
            <button 
                onClick={() => onUpdateStatus?.(operacao.id, isConcluido ? 'em_andamento' : 'concluido')} 
                className={cn("flex-1 sm:flex-none px-4 sm:px-3 h-8 sm:h-8 flex items-center justify-center gap-1.5 rounded-lg font-black text-[8px] sm:text-[8px] uppercase border transition-all shadow-lg", isConcluido ? "bg-zinc-900 border-white/5 text-zinc-500" : "btn-insane-green border-profit/20")}
            >
                {isConcluido ? <RefreshCcw size={12} /> : <CheckCircle2 size={12} strokeWidth={3} />}
                <span>{isConcluido ? 'Reabrir' : 'Liquidar'}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/[0.01] border-t border-white/5">
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                {(operacao.fases || []).map((fase: any, idx: number) => (
                  <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2 group/fase transition-all hover:bg-black/60 relative flex flex-col justify-between">
                    <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                        <span className="text-[8px] font-black text-white uppercase italic">{fase.nome === 'FREEBET' ? 'Free bet' : (fase.nome || `Fase #${idx+1}`)}</span>
                        <button onClick={() => onEditFase?.(operacao.id, fase, idx)} className="p-1 rounded bg-white/5 text-zinc-500 hover:text-white opacity-0 group-hover:fase:opacity-100 transition-all"><SquarePen size={10}/></button>
                    </div>
                    <div className="space-y-1 py-1">
                        {(fase.entradas || []).map((ent: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase">
                                <span className="truncate max-w-[100px]">{ent.casa || `Casa ${i+1}`}</span>
                                <span className="text-zinc-300 font-mono">{formatCurrency(Number(ent.stake))}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-end pt-1.5 border-t border-white/5">
                        <p className="text-[7px] font-black text-zinc-600 uppercase">Líquido</p>
                        <p className={cn("text-xs font-black font-mono", Number(fase.lucro) >= 0 ? "text-profit" : "text-red-500")}>{formatCurrency(Number(fase.lucro))}</p>
                    </div>
                  </div>
                ))}
                <div className="relative group/btn-container h-full min-h-[100px] flex items-center justify-center">
                  <button onClick={() => onAddQualificacao?.(operacao.id)} className="w-full max-w-[160px] h-[80px] flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-profit/50 transition-all duration-500 relative overflow-hidden active:scale-95 shadow-inner">
                      <div className="absolute inset-0 bg-profit/5 opacity-0 group-hover/btn-container:opacity-100 transition-opacity" />
                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/10 group-hover/btn-container:border-profit/50 transition-all">
                            <PlusCircle size={16} className="text-zinc-500 group-hover/btn-container:text-profit group-hover/btn-container:rotate-90 transition-all" />
                          </div>
                          <span className="text-[8px] font-black text-zinc-500 group-hover/btn-container:text-white uppercase tracking-[0.2em]">Nova Fase</span>
                      </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OperacaoCard;
