import React, { useMemo, useEffect } from 'react';
import { useData } from '../services/useData';
import { TrendingUp, Wallet, Activity, Flame, Target, Zap, Clock, Award, Briefcase, Calendar, Gift } from 'lucide-react';
import { calculateDetailedMetrics, calculateEvolutionData, getNetProfit, calculateCurrentStreak, safeFixed } from '../utils/calculations';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { useDateFilter } from '../contexts/DateFilterContext';
import { cn } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';

// --- MINI CARD UNIFICADO ---
const StatMiniCard = ({ title, value, icon: Icon, color, delta }: any) => (
    <div className="glass-panel px-3 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 gpu-accelerated hover:bg-white/5 transition-colors border border-white/5 w-full shadow-lg relative overflow-hidden">
        <div className={cn("p-1.5 rounded-lg shrink-0 mb-0.5", color)}>
            <Icon size={12} />
        </div>
        <div className="min-w-0 w-full">
            <p className="text-[6px] sm:text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] leading-none mb-1">{title}</p>
            <div className="flex items-center justify-center gap-1">
                <p className="text-xs sm:text-base font-black text-white leading-tight tracking-tighter truncate">{value}</p>
                {delta !== undefined && (
                    <span className={cn("text-[7px] font-bold px-1 rounded", delta >= 0 ? "text-profit bg-profit/10" : "text-red-500 bg-red-500/10")}>
                        {delta >= 0 ? '+' : ''}{delta}%
                    </span>
                )}
            </div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  const { operacoes, bancaInicial, fullReload, loading, configuracoes } = useData();
  const { startDate, endDate, setStartDate, setEndDate } = useDateFilter();

  useEffect(() => { fullReload(); }, [fullReload]);

  const { metricas, ranking } = useMemo(() => {
    if (!startDate || !endDate || !operacoes) return { metricas: null, ranking: [] };
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    
    const filteredOps = operacoes.filter(op => {
      if (!op.data) return false;
      const opTime = new Date(op.data).getTime();
      return opTime >= start.getTime() && opTime <= end.getTime();
    });

    const currentMetrics = calculateDetailedMetrics(filteredOps, bancaInicial);
    const streak = calculateCurrentStreak(operacoes);
    const topCasa = (() => {
        const casas: Record<string, number> = {};
        filteredOps.slice(0, 50).forEach(op => {
            const casaNome = op.fases?.[0]?.entradas?.[0]?.casa || 'N/A';
            if (casaNome !== 'N/A') casas[casaNome] = (casas[casaNome] || 0) + 1;
        });
        return Object.entries(casas).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Analisando...';
    })();

    return { metricas: { ...currentMetrics, streak, topCasa }, ranking: [] };
  }, [operacoes, bancaInicial, startDate, endDate]);

  if (loading) return <div className="p-10 space-y-4"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-4 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div></div>;

  const m = metricas;
  if (!m) return null;

  const metaMensal = Number(configuracoes?.find((c: any) => c.chave === 'meta_lucro')?.valor || 0);
  const progresso = metaMensal > 0 ? Math.min(100, (m.lucroRealizado / metaMensal) * 100) : 0;
  const lucroProjetado = (operacoes || []).filter(o => !['concluido', 'finalizada'].includes(o.status)).reduce((acc, op) => acc + getNetProfit(op), 0);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER COMPACTO */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">NINE NINE <span className="text-profit">99 PRO</span></h1>
            <p className="text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Torre de Controle Operacional</p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
            <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
        </div>
      </div>

      {/* META MENSAL ULTRA SLIM */}
      {metaMensal > 0 && (
        <div className="glass-panel p-3 rounded-xl border border-profit/20 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-profit/10 rounded-lg text-profit"><Target size={14} /></div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Meta Mensal de Lucro</span>
                </div>
                <div className="text-right">
                    <span className="text-xs font-black text-profit font-mono">{progresso.toFixed(1)}%</span>
                </div>
            </div>
            <div className="h-1.5 bg-black rounded-full border border-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-profit/40 to-profit shadow-[0_0_10px_#10b981] transition-all duration-1000" style={{ width: `${progresso}%` }} />
            </div>
            <p className="text-[7px] text-zinc-500 font-black uppercase text-center mt-2 tracking-[0.2em]">Faltam R$ {Math.max(0, metaMensal - m.lucroRealizado).toLocaleString('pt-BR')} para o alvo</p>
        </div>
      )}

      {/* STATS PRINCIPAIS (ELITE 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatMiniCard title="Banca Atual" value={`R$ ${m.bancaAtual.toLocaleString('pt-BR')}`} icon={Wallet} color="bg-indigo-500/10 text-indigo-400" />
        <StatMiniCard title="Lucro Período" value={`R$ ${m.lucroRealizado.toLocaleString('pt-BR')}`} icon={TrendingUp} color="bg-profit/10 text-profit" delta={safeFixed(m.roi, 1)} />
        <StatMiniCard title="Taxa de Acerto" value={`${m.winRate}%`} icon={Activity} color="bg-sky-500/10 text-sky-400" />
        <StatMiniCard title="Streak Atual" value={m.streak} icon={Flame} color="bg-orange-500/10 text-orange-500" />
      </div>

      {/* PAINEL TÁTICO: RADAR E DOMINÂNCIA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* RADAR DE EXECUÇÃO (EXPOSIÇÃO) */}
        <div className="glass-panel p-4 rounded-xl lg:col-span-2 border border-white/5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="p-2 bg-white/5 rounded-lg text-zinc-400"><Zap size={16} /></div>
                <div className="min-w-0">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Radar de Execução</h3>
                    <p className="text-[7px] text-zinc-600 font-black uppercase">Capital em Campo</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">Capital em Risco</p>
                    <p className="text-xl font-black text-red-500 font-mono tracking-tighter">R$ {m.dinheiroEmJogo.toLocaleString('pt-BR')}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-sky-500/10 px-1.5 py-0.5 rounded text-[7px] font-black text-sky-400 border border-sky-500/20"><Clock size={8}/> {operacoes?.filter(o => o.status === 'em_andamento').length} Ativas</div>
                        <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded text-[7px] font-black text-amber-400 border border-amber-500/20"><Gift size={8}/> {operacoes?.filter(o => o.status === 'aguardando_freebet').length} Freebets</div>
                    </div>
                </div>
                <div>
                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">Expectativa de Green</p>
                    <p className="text-xl font-black text-profit font-mono tracking-tighter text-glow-profit">+R$ {lucroProjetado.toLocaleString('pt-BR')}</p>
                    <p className="text-[7px] text-zinc-500 font-medium mt-2 leading-relaxed uppercase tracking-tighter">Lucro líquido estimado após liquidação total.</p>
                </div>
            </div>
            <button onClick={() => window.location.href='/operacoes'} className="w-full py-2 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black text-zinc-500 uppercase tracking-widest hover:bg-profit hover:text-black hover:border-profit transition-all">Acessar Gerenciamento</button>
        </div>

        {/* DOMINÂNCIA E PERFORMANCE */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-4">
                <div className="p-2 bg-white/5 rounded-lg text-zinc-400"><Award size={16} /></div>
                <div className="min-w-0">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Dominância</h3>
                    <p className="text-[7px] text-zinc-600 font-black uppercase">Top Performance</p>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-profit/10 border border-profit/20 flex items-center justify-center text-profit"><Zap size={14}/></div>
                        <div><p className="text-[7px] font-black text-zinc-600 uppercase leading-none mb-1">Estratégia Elite</p><p className="text-[10px] font-black text-white uppercase">{m.melhorProcedimento}</p></div>
                    </div>
                    <div className="text-right"><p className="text-[9px] font-black text-profit font-mono">ROI HIGH</p></div>
                </div>
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500"><Briefcase size={14}/></div>
                        <div><p className="text-[7px] font-black text-zinc-600 uppercase leading-none mb-1">Casa de Confiança</p><p className="text-[10px] font-black text-white uppercase">{m.topCasa}</p></div>
                    </div>
                    <div className="text-right"><p className="text-[9px] font-black text-zinc-500 font-mono">MAX VOL</p></div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-1.5"><span className="text-[7px] font-black text-zinc-600 uppercase">Eficiência Geral</span><span className="text-[9px] font-black text-sky-400 font-mono">{m.winRate}%</span></div>
                <div className="h-1 bg-black rounded-full overflow-hidden border border-white/5"><div className="h-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]" style={{ width: `${m.winRate}%` }} /></div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
