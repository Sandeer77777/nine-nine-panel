import React, { useMemo } from 'react';
import { useData } from '../services/useData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Receipt, CreditCard, Activity, Plus, X, LineChart as LineIcon, BarChart3, Trash2 } from 'lucide-react';
import { format, parseISO, compareAsc, endOfMonth, differenceInDays, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getNetProfit, safeNum } from '../utils/calculations';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

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

const Financeiro: React.FC = () => {
    const { operacoes, transacoes, bancaInicial, addTransacao, deleteTransacao } = useData();
    const [isAddingCost, setIsAddingCost] = React.useState(false);
    const [newCost, setNewCost] = React.useState({ descricao: '', valor: '' });

    const handleAddCost = async () => {
        if (!newCost.descricao || !newCost.valor) return;
        await addTransacao({
            data: new Date().toISOString(), descricao: newCost.descricao, valor: Number(newCost.valor),
            tipo: 'despesa', categoria: 'Custo Fixo', status: 'consolidado', metodo: 'Sistema'
        });
        setNewCost({ descricao: '', valor: '' }); setIsAddingCost(false);
        toast.success('Custo registrado!');
    };

    const data = useMemo(() => {
        const closedOps = operacoes.filter(op => ['concluido', 'finalizada'].includes(op.status));
        const lucroBruto = closedOps.reduce((acc, op) => acc + getNetProfit(op), 0);
        const custosFixos = transacoes.filter(t => t.tipo === 'despesa' && !t.origem_operacao_id).reduce((acc, t) => acc + safeNum(t.valor), 0);
        const lucroLiquidoReal = lucroBruto - custosFixos;
        const margemLiquida = lucroBruto > 0 ? (lucroLiquidoReal / lucroBruto) * 100 : 0;
        const investimentoTotal = (bancaInicial || 0) + custosFixos;
        const roiReal = investimentoTotal > 0 ? (lucroLiquidoReal / investimentoTotal) * 100 : 0;

        const now = new Date();
        const startMonth = startOfMonth(now);
        const endMonth = endOfMonth(now);
        const daysPassed = Math.max(1, differenceInDays(now, startMonth));
        const daysRemaining = Math.max(0, differenceInDays(endMonth, now));
        const currentMonthOps = closedOps.filter(op => op.data && parseISO(op.data) >= startMonth);
        const currentMonthProfit = currentMonthOps.reduce((acc, op) => acc + getNetProfit(op), 0);
        const avgDailyProfit = currentMonthProfit / daysPassed;
        const projection = currentMonthProfit + (avgDailyProfit * daysRemaining);

        const monthlyMap = new Map();
        closedOps.filter(op => op.data).forEach(op => {
            const date = parseISO(op.data);
            const key = format(date, 'yyyy-MM');
            const label = format(date, 'MMM/yy', { locale: ptBR });
            const current = monthlyMap.get(key) || { key, label, Lucro: 0, Custos: 0, date };
            current.Lucro += getNetProfit(op);
            monthlyMap.set(key, current);
        });
        transacoes.filter(t => t.tipo === 'despesa' && !t.origem_operacao_id && t.data).forEach(t => {
            const date = parseISO(t.data);
            const key = format(date, 'yyyy-MM');
            const label = format(date, 'MMM/yy', { locale: ptBR });
            const current = monthlyMap.get(key) || { key, label, Lucro: 0, Custos: 0, date };
            current.Custos += safeNum(t.valor);
            monthlyMap.set(key, current);
        });

        const chartData = Array.from(monthlyMap.values()).sort((a, b) => compareAsc(a.date, b.date)).map(d => ({ name: d.label, Lucro: d.Lucro, Custos: d.Custos }));
        return { lucroBruto, custosFixos, lucroLiquidoReal, margemLiquida, roiReal, chartData, projection };
    }, [operacoes, transacoes, bancaInicial]);

    return (
        <div className="space-y-4 sm:space-y-5 pb-20 animate-in fade-in duration-500">
            {/* HEADER COMPACTO */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="text-center lg:text-left">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Gestão <span className="text-profit">Financeira</span></h1>
                    <p className="text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Conciliação Real de Lucros e Custos</p>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    {isAddingCost ? (
                        <div className="flex items-center gap-2 glass-panel !p-1 !rounded-xl animate-in slide-in-from-right-2 w-full">
                            <input placeholder="DESCRIÇÃO..." className="bg-black border border-white/5 rounded-lg px-3 py-1.5 text-[9px] text-white outline-none focus:border-profit/50 flex-1 font-black uppercase tracking-widest" value={newCost.descricao} onChange={e => setNewCost({...newCost, descricao: e.target.value})} />
                            <input type="number" placeholder="VALOR..." className="bg-black border border-white/5 rounded-lg px-3 py-1.5 text-[9px] text-white outline-none focus:border-profit/50 w-20 font-black font-mono" value={newCost.valor} onChange={e => setNewCost({...newCost, valor: e.target.value})} />
                            <button onClick={handleAddCost} className="p-2 bg-profit text-black rounded-lg active:scale-95 transition-all"><Plus size={14} strokeWidth={4}/></button>
                            <button onClick={() => setIsAddingCost(false)} className="p-2 bg-white/5 text-zinc-500 rounded-lg hover:text-white transition-colors"><X size={14}/></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsAddingCost(true)} className="h-9 px-6 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-profit/30 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                            <Receipt size={14} /> <span>Lançar Despesa</span>
                        </button>
                    )}
                </div>
            </div>

            {/* STATS FINANCEIROS (ELITE 4) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <StatMiniCard title="Lucro Bruto" value={formatCurrency(data.lucroBruto)} icon={TrendingUp} color="bg-indigo-500/10 text-indigo-400" />
                <StatMiniCard title="Custos Fixos" value={`-${formatCurrency(data.custosFixos)}`} icon={Receipt} color="bg-red-500/10 text-red-400" />
                <StatMiniCard title="Líquido Real" value={formatCurrency(data.lucroLiquidoReal)} icon={Target} color="bg-profit/10 text-profit" />
                <StatMiniCard title="Margem ROI" value={`${data.margemLiquida.toFixed(1)}%`} icon={Activity} color="bg-sky-500/10 text-sky-400" />
            </div>

            {/* PROJEÇÃO MENSAL SLIM */}
            <div className="glass-panel p-3 rounded-xl border border-profit/20 relative overflow-hidden group">
                <div className="flex items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-profit/10 rounded-lg text-profit shadow-[0_0_15px_rgba(16,185,129,0.1)]"><BarChart3 size={16} /></div>
                        <div className="min-w-0">
                            <h3 className="text-[9px] font-black text-white uppercase tracking-widest">Alvo Projetado (Mensal)</h3>
                            <p className="text-[7px] text-zinc-500 font-black uppercase">Baseado no ritmo diário atual</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-profit font-mono tracking-tighter text-glow-profit">{formatCurrency(data.projection)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* FLUXO MENSAL COMPACTO */}
                <div className="glass-panel p-4 rounded-xl bg-[#050505] border border-white/5">
                    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
                        <LineIcon size={14} className="text-zinc-500" />
                        <h3 className="text-[9px] font-black text-white uppercase tracking-widest">Fluxo de Caixa</h3>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1e" vertical={false} />
                                <XAxis dataKey="name" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 8, fontWeight: 800 }} axisLine={false} />
                                <YAxis hide />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '10px' }} />
                                <Bar dataKey="Lucro" fill="#10b981" radius={[2, 2, 0, 0]} barSize={12} />
                                <Bar dataKey="Custos" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* EXTRATO DE DESPESAS SLIM */}
                <div className="lg:col-span-2 glass-panel p-0 overflow-hidden border border-white/5 rounded-xl">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 text-zinc-500"><CreditCard size={14} /></div>
                            <div>
                              <h3 className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Extrato de Despesas</h3>
                              <p className="text-[7px] text-zinc-600 font-black uppercase mt-1">Controle de Saídas Manuais</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 border-b border-white/5">
                                <tr>
                                    <th className="px-4 py-2 text-[7px] font-black text-zinc-500 uppercase tracking-widest">Descrição</th>
                                    <th className="px-4 py-2 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-center">Data</th>
                                    <th className="px-4 py-2 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-right">Valor</th>
                                    <th className="px-4 py-2 text-[7px] font-black text-zinc-500 uppercase tracking-widest text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transacoes.filter(t => t.tipo === 'despesa' && !t.origem_operacao_id).length > 0 ? 
                                    transacoes.filter(t => t.tipo === 'despesa' && !t.origem_operacao_id).map(t => (
                                    <tr key={t.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-4 py-2.5">
                                          <p className="font-black text-white uppercase text-[10px] tracking-tight group-hover:text-profit transition-colors">{t.descricao}</p>
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-[9px] font-bold text-zinc-600 font-mono">{t.data ? format(parseISO(t.data), 'dd/MM/yy') : 'N/A'}</td>
                                        <td className="px-4 py-2.5 text-right font-black font-mono text-[11px] text-red-500">-{formatCurrency(t.valor)}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <button onClick={() => { if(confirm('Excluir?')) deleteTransacao(t.id); }} className="p-1.5 text-zinc-700 hover:text-red-500 transition-all active:scale-90"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center py-10 text-[8px] font-black text-zinc-800 uppercase tracking-widest italic">Nenhuma despesa registrada</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Financeiro;
