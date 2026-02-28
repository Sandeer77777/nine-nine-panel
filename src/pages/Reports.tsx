import React, { useMemo } from 'react';
import { useData } from '../services/useData';
import { TrendingUp, DollarSign, Activity, PieChart as PieIcon, Hourglass, CheckCircle2, Clock, FileDown, Search, ArrowUpRight, BarChart3, TrendingDown, Calendar } from 'lucide-react';
import { format, parseISO, isWithinInterval, subMonths, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { safeNum, getNetProfit, calculateDetailedMetrics, safeFixed } from '../utils/calculations';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { useDateFilter } from '../contexts/DateFilterContext';
import { cn } from '../lib/utils';

const formatCurrency = (value: number) => {
    const num = typeof value === 'number' && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

// --- MINI CARD UNIFICADO ---
const StatMiniCard = ({ title, value, icon: Icon, color, sub }: any) => (
    <div className="glass-panel px-2.5 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-0.5 gpu-accelerated hover:bg-white/5 transition-colors border border-white/5 w-full">
        <div className={cn("p-1 rounded mb-0.5", color)}>
            <Icon size={10} />
        </div>
        <div className="min-w-0 w-full">
            <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{title}</p>
            <p className="text-[10px] font-black text-white leading-tight tracking-tighter truncate">{value}</p>
            {sub && <p className="text-[5px] font-bold text-slate-700 uppercase mt-0.5">{sub}</p>}
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const s = (status || '').toLowerCase();
    if (s === 'concluido' || s === 'finalizada') return <span className="px-1.5 py-0.5 rounded bg-profit/5 text-profit text-[7px] font-black border border-profit/10">PAGA</span>;
    if (s === 'aguardando_freebet') return <span className="px-1.5 py-0.5 rounded bg-amber-500/5 text-amber-500 text-[7px] font-black border border-amber-500/10">PENDENTE</span>;
    return <span className="px-1.5 py-0.5 rounded bg-sky-500/5 text-sky-400 text-[7px] font-black border border-sky-500/10">ATIVA</span>;
};

const Reports: React.FC = () => {
    const { operacoes } = useData();
    const { startDate, endDate, setStartDate, setEndDate } = useDateFilter();
    const [searchTerm, setSearchTerm] = React.useState('');

    const { stats, lineChartData, strategyData, detailedOps, drawdownData, monthComparison, heatmapData } = useMemo(() => {
        const start = parseISO(startDate + 'T00:00:00'); const end = parseISO(endDate + 'T23:59:59');
        const filteredOps = (operacoes || []).filter(op => op.data && isWithinInterval(parseISO(op.data), { start, end }) && op.nome?.toLowerCase().includes(searchTerm.toLowerCase()));
        const metrics = calculateDetailedMetrics(filteredOps, 0);
        
        const dailyData = new Map<string, number>();
        filteredOps.forEach(op => { if(op.data && ['concluido', 'finalizada'].includes(op.status)) dailyData.set(op.data, (dailyData.get(op.data) || 0) + getNetProfit(op)); });
        let cumulative = 0, peak = 0;
        const lineChartData = Array.from(dailyData.entries()).sort((a,b) => parseISO(a[0]).getTime() - parseISO(b[0]).getTime()).map(([date, profit]) => {
            cumulative += profit; if (cumulative > peak) peak = cumulative;
            return { name: format(parseISO(date), 'dd/MM'), Lucro: cumulative, Drawdown: cumulative - peak };
        });
        const drawdownData = lineChartData.map(d => ({ name: d.name, value: Math.abs(d.Drawdown) }));
        const weekdayProfit = new Array(7).fill(0);
        filteredOps.forEach(op => { if (op.data && ['concluido', 'finalizada'].includes(op.status)) weekdayProfit[getDay(parseISO(op.data))] += getNetProfit(op); });
        const heatmapData = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => ({ day, profit: weekdayProfit[idx] }));
        
        const now = new Date();
        const currMonthMetrics = calculateDetailedMetrics((operacoes || []).filter(op => op.data && isWithinInterval(parseISO(op.data), { start: startOfMonth(now), end: now })), 0);
        const prevMonthMetrics = calculateDetailedMetrics((operacoes || []).filter(op => op.data && isWithinInterval(parseISO(op.data), { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) })), 0);
        const monthVar = prevMonthMetrics.lucroRealizado !== 0 ? ((currMonthMetrics.lucroRealizado - prevMonthMetrics.lucroRealizado) / Math.abs(prevMonthMetrics.lucroRealizado)) * 100 : (currMonthMetrics.lucroRealizado > 0 ? 100 : 0);

        return { stats: { ...metrics, totalOps: metrics.countTotal }, lineChartData, strategyData: metrics.barChartData, drawdownData, heatmapData, monthComparison: { current: currMonthMetrics.lucroRealizado, previous: prevMonthMetrics.lucroRealizado, variation: monthVar }, detailedOps: filteredOps.sort((a, b) => parseISO(b.data).getTime() - parseISO(a.data).getTime()) };
    }, [operacoes, startDate, endDate, searchTerm]);

    const handleExportCSV = () => {
        if (detailedOps.length === 0) return;
        const rows = detailedOps.map(op => [op.data, op.nome, op.estrategia, op.status, op.investido, op.retorno, getNetProfit(op)]);
        const csvContent = [["Data", "Operação", "Estratégia", "Status", "Apostado", "Retorno", "Lucro"], ...rows].map(e => e.join(";")).join("\n");
        const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' }));
        link.download = `Relatorio_99_${format(new Date(), 'yyyy-MM-dd')}.csv`; link.click();
    };

    return (
        <div className="space-y-4 sm:space-y-5 pb-20 animate-in fade-in duration-500">
            {/* HEADER COMPACTO */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="text-center lg:text-left">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Relatórios <span className="text-profit">Auditoria</span></h1>
                    <p className="text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Análise de Performance Tática</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                    <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
                    <button onClick={handleExportCSV} className="h-9 px-4 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"><FileDown size={14} /> Exportar</button>
                </div>
            </div>

            {/* BUSCA SLIM */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="BUSCAR POR NOME..." className="h-9 w-full bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-white text-center outline-none focus:border-profit/30 transition-all placeholder-slate-700" />
            </div>

            {/* KPI GRID ELITE */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                <StatMiniCard title="Lucro Líquido" value={formatCurrency(stats.lucroRealizado)} icon={DollarSign} color="bg-indigo-500/10 text-indigo-400" />
                <StatMiniCard title="Retorno Bruto" value={formatCurrency(stats.totalReturn)} icon={ArrowUpRight} color="bg-profit/10 text-profit" />
                <StatMiniCard title="Apostado" value={formatCurrency(stats.totalStake)} icon={Activity} color="bg-white/5 text-zinc-400" />
                <StatMiniCard title="ROI Período" value={`${safeFixed(stats.roi, 1)}%`} icon={TrendingUp} color="bg-cyan-500/10 text-cyan-400" />
                <StatMiniCard title="Win Rate" value={`${safeFixed(stats.winRate, 1)}%`} icon={PieIcon} color="bg-indigo-500/10 text-indigo-400" />
                <StatMiniCard title="Em Aberto" value={formatCurrency(stats.dinheiroEmJogo)} icon={Hourglass} color="bg-amber-500/10 text-amber-400" />
            </div>

            {/* COMPARAÇÃO MENSAL SLIM */}
            <div className="glass-panel p-3 rounded-xl border border-profit/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-profit/10 rounded-lg text-profit"><BarChart3 size={16} /></div>
                    <div className="min-w-0">
                        <h3 className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Performance Mensal</h3>
                        <p className="text-[7px] text-zinc-600 font-black uppercase mt-1">Status vs Mês Anterior</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center"><p className="text-[6px] font-black text-zinc-600 uppercase">Mês Passado</p><p className="text-[10px] font-black text-zinc-500 font-mono">{formatCurrency(monthComparison.previous)}</p></div>
                    <div className="text-center"><p className="text-[6px] font-black text-white uppercase">Mês Atual</p><p className="text-[11px] font-black text-white font-mono">{formatCurrency(monthComparison.current)}</p></div>
                    <div className={cn("px-3 py-1 rounded text-[8px] font-black uppercase border", monthComparison.variation >= 0 ? "bg-profit/10 text-profit border-profit/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>{monthComparison.variation >= 0 ? '+' : ''}{safeFixed(monthComparison.variation, 1)}%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* EQUITY SLIM */}
                <div className="glass-panel p-4 rounded-xl bg-[#050505] border border-white/5">
                    <h3 className="text-[9px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Evolução de Equity</h3>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lineChartData}>
                                <defs><linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1e" vertical={false} />
                                <XAxis dataKey="name" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 8, fontWeight: 800 }} axisLine={false} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '10px' }} />
                                <Area type="monotone" dataKey="Lucro" stroke="#10b981" strokeWidth={3} fill="url(#colorP)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* DRAWDOWN SLIM */}
                <div className="glass-panel p-4 rounded-xl bg-[#050505] border border-white/5">
                    <h3 className="text-[9px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Curva de Risco (Drawdown)</h3>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={drawdownData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1e" vertical={false} />
                                <XAxis dataKey="name" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 8, fontWeight: 800 }} axisLine={false} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '10px' }} />
                                <Bar dataKey="value" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={12} opacity={0.4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* LOG DE AUDITORIA SLIM */}
            <div className="glass-panel p-0 overflow-hidden border border-white/5 rounded-xl shadow-2xl">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-profit"><Clock size={14}/></div>
                        <div><h3 className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Log de Auditoria</h3><p className="text-[7px] text-zinc-600 font-black uppercase mt-1">Registros Oficiais</p></div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-black border border-white/5 text-[7px] font-black text-zinc-500">{detailedOps.length} CICLOS</span>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 border-b border-white/5">
                            <tr>
                                <th className="px-4 py-2 text-[7px] font-black text-zinc-500 uppercase tracking-widest">Operação</th>
                                <th className="px-4 py-2 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-4 py-2 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-right">Líquido</th>
                                <th className="px-4 py-2 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-right">ROI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {detailedOps.length > 0 ? detailedOps.map(op => {
                                const lucro = getNetProfit(op);
                                const investido = (op.fases || []).reduce((sum: number, f: any) => sum + safeNum(f.investido || f.stake), 0) || safeNum(op.investido || op.stake);
                                const roiOp = investido > 0 ? (lucro / investido) * 100 : 0;
                                return (
                                <tr key={op.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-4 py-2.5">
                                        <p className="font-black text-white text-[10px] uppercase tracking-tight group-hover:text-profit">{op.nome}</p>
                                        <p className="text-[7px] text-zinc-600 font-bold uppercase mt-0.5">{op.data ? format(parseISO(op.data), 'dd/MM/yy') : 'N/A'} • {op.estrategia === 'freebet' ? 'Free bet' : op.estrategia}</p>
                                    </td>
                                    <td className="px-4 py-2.5 text-center"><StatusBadge status={op.status} /></td>
                                    <td className={cn("px-4 py-2.5 text-right font-black font-mono text-[10px]", lucro >= 0 ? "text-profit" : "text-red-500")}>{formatCurrency(lucro)}</td>
                                    <td className={cn("px-4 py-2.5 text-right font-bold font-mono text-[8px] italic opacity-40")}>{safeFixed(roiOp, 1)}%</td>
                                </tr>
                            )}) : (
                                <tr><td colSpan={4} className="text-center py-10 text-[8px] font-black text-zinc-800 uppercase tracking-widest italic">Sem registros</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
