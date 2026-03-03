import React, { useState, useEffect } from 'react';
import { 
  Calculator, X, Link, Plus, Settings2, ChevronDown, 
  Trophy, Clock, Target, Trash2, Zap, RefreshCw, 
  TrendingUp, Wallet, ShieldCheck, Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../services/useData';
import { 
  BetInput, 
  calculateNormalStrategy, 
  calculateFreebetStrategy, 
  calculateCashbackStrategy,
  CalculationResult,
  Utils 
} from '../utils/calculadoraEngine';
import toast from 'react-hot-toast';

// --- COMPONENTES AUXILIARES ---

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
      active 
        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
        : "bg-black text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
    )}
  >
    <Icon size={14} />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const InputField = ({ label, value, onChange, type = "text", prefix, suffix, placeholder }: any) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
    <label className="text-[7px] font-black text-zinc-600 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute -inset-px bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300" />
      <div className="relative flex items-center bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden focus-within:border-cyan-500/50 transition-colors">
        {prefix && <span className="pl-3 text-[10px] font-black text-zinc-700">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none py-2.5 px-3 text-xs font-bold text-white focus:ring-0 placeholder:text-zinc-800"
        />
        {suffix && <span className="pr-3 text-[10px] font-black text-zinc-700">{suffix}</span>}
      </div>
    </div>
  </div>
);

const Calculadora: React.FC = () => {
  const { casasApostas } = useData();
  
  // --- ESTADO DO JOGO (NOVA FUNCIONALIDADE) ---
  const [jogo, setJogo] = useState<string>('');
  const [horario, setHorario] = useState<string>('');
  const [isEditingJogo, setIsEditingJogo] = useState(false);

  // --- ESTADO DA CALCULADORA ---
  const [strategy, setStrategy] = useState<'normal' | 'freebet' | 'cashback'>('normal');
  const [bets, setBets] = useState<BetInput[]>([
    { odd: 2.0, stake: 100, commission: 0, isLay: false, isFreebet: false },
    { odd: 2.0, commission: 0, isLay: false, isFreebet: false }
  ]);
  const [cashbackRate, setCashbackRate] = useState<number>(0);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // --- LÓGICA DE CÁLCULO ---
  useEffect(() => {
    let res: CalculationResult | null = null;
    
    if (strategy === 'normal') {
      res = calculateNormalStrategy(bets);
    } else if (strategy === 'freebet') {
      res = calculateFreebetStrategy(bets[0], bets.slice(1));
    } else if (strategy === 'cashback') {
      res = calculateCashbackStrategy(bets[0], bets.slice(1), cashbackRate);
    }
    
    setResult(res);
  }, [bets, strategy, cashbackRate]);

  const updateBet = (index: number, field: keyof BetInput, value: any) => {
    const newBets = [...bets];
    newBets[index] = { ...newBets[index], [field]: value };
    setBets(newBets);
  };

  const addBet = () => {
    if (bets.length < 5) {
      setBets([...bets, { odd: 2.0, commission: 0, isLay: false, isFreebet: false }]);
    } else {
      toast.error("Limite de 5 casas atingido");
    }
  };

  const removeBet = (index: number) => {
    if (bets.length > 2) {
      setBets(bets.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER ELITE COM JOGO INTEGRADO */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-[2rem] bg-zinc-950/50 border border-zinc-900 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
          <Calculator size={160} className="rotate-12" />
        </div>

        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tight leading-none">Calculadora</h2>
                <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[7px] font-black text-cyan-400 uppercase tracking-widest">v2.0</div>
              </div>
              
              {/* ÁREA DO JOGO - DINÂMICA */}
              <div 
                className="mt-2 flex items-center gap-2 cursor-pointer group/jogo max-w-[280px] sm:max-w-md hover:bg-white/5 p-1 rounded-lg transition-all"
                onClick={() => setIsEditingJogo(true)}
              >
                {!isEditingJogo ? (
                  <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                    <Trophy size={10} className={cn("text-zinc-700 group-hover/jogo:text-cyan-400 transition-colors", jogo ? "text-cyan-500" : "")} />
                    <span className={cn(
                      "text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate transition-colors",
                      jogo ? "text-zinc-300" : "text-zinc-700 italic group-hover/jogo:text-zinc-500"
                    )}>
                      {jogo || 'Definir Confronto...'}
                    </span>
                    {horario && (
                      <>
                        <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                        <Clock size={10} className="text-cyan-500/50" />
                        <span className="text-[9px] sm:text-[10px] font-black text-cyan-500/70 font-mono tracking-tighter">{horario}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <input 
                      autoFocus
                      placeholder="SPORTING CP X PORTO"
                      value={jogo}
                      onChange={(e) => setJogo(e.target.value.toUpperCase())}
                      onBlur={() => setIsEditingJogo(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingJogo(false)}
                      className="bg-black/40 border border-cyan-500/30 rounded-lg px-2 py-1 text-[9px] font-black text-white w-32 sm:w-48 focus:ring-0 focus:border-cyan-500"
                    />
                    <input 
                      type="time"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      onBlur={() => setIsEditingJogo(false)}
                      className="bg-black/40 border border-cyan-500/30 rounded-lg px-2 py-1 text-[9px] font-black text-white w-20 focus:ring-0 focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button className="p-2 sm:p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl text-zinc-600 hover:text-white transition-all border border-zinc-800/50">
               <RefreshCw size={18} />
             </button>
          </div>
        </div>

        {/* INPUT DE IMPORTAÇÃO RÁPIDA */}
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 w-full mt-2">
          <div className="flex flex-1 items-center gap-2 w-full">
            <div className="relative flex-1 group">
              <div className="absolute -inset-px bg-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="relative flex items-center bg-black border border-zinc-800 rounded-xl hover:border-cyan-500/40 transition-colors">
                <Link className="absolute left-3 h-4 w-4 text-zinc-700" />
                <input 
                  type="text" 
                  placeholder="COLE O LINK DA OPERAÇÃO..." 
                  className="w-full bg-transparent border-none rounded-xl pl-10 pr-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white focus:ring-0 placeholder-zinc-800"
                />
              </div>
            </div>
            <button className="h-11 px-6 bg-zinc-900 hover:bg-cyan-500 hover:text-black text-zinc-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl min-w-max border border-zinc-800 hover:border-cyan-400">
              Importar
            </button>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={addBet}
              className="flex-1 md:w-36 h-11 flex items-center gap-2 bg-black hover:bg-zinc-900 px-4 rounded-xl border border-zinc-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="p-1 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <Plus size={12} strokeWidth={4} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[6px] font-black text-zinc-700 uppercase leading-none mb-0.5 tracking-tighter">Adicionar</span>
                <span className="text-[9px] font-bold text-white">Nova Casa</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* SELETOR DE ESTRATÉGIA */}
      <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-2xl">
        <TabButton active={strategy === 'normal'} onClick={() => setStrategy('normal')} label="Normal / Arbitragem" icon={Zap} />
        <TabButton active={strategy === 'freebet'} onClick={() => setStrategy('freebet')} label="Freebet (SNR)" icon={GiftIcon} />
        <TabButton active={strategy === 'cashback'} onClick={() => setStrategy('cashback')} label="Cashback / Reembolso" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ENTRADAS - COLUNA DA ESQUERDA */}
        <div className="lg:col-span-7 space-y-4">
          {bets.map((bet, index) => (
            <div 
              key={index} 
              className={cn(
                "glass-panel p-4 rounded-2xl border transition-all duration-300 relative group/card",
                index === 0 ? "border-cyan-500/20 bg-cyan-500/[0.02]" : "border-zinc-900 bg-black"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border",
                    index === 0 ? "bg-cyan-500 text-black border-cyan-400" : "bg-zinc-900 text-zinc-500 border-zinc-800"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black text-white uppercase tracking-widest leading-none mb-1">
                      {index === 0 ? "Entrada Principal" : `Cobertura ${index}`}
                    </h4>
                    <p className="text-[7px] text-zinc-600 font-black uppercase tracking-tighter">Configuração de Odds e Stake</p>
                  </div>
                </div>
                
                {index > 1 && (
                  <button onClick={() => removeBet(index)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <InputField 
                  label="Odd" 
                  value={bet.odd} 
                  onChange={(v: string) => updateBet(index, 'odd', Utils.parseFlex(v))} 
                  placeholder="1.00"
                />
                {(index === 0 || strategy === 'normal') && (
                  <InputField 
                    label="Stake" 
                    value={bet.stake || ''} 
                    onChange={(v: string) => updateBet(index, 'stake', Utils.parseFlex(v))} 
                    prefix="R$"
                    placeholder="0.00"
                  />
                )}
                <InputField 
                  label="Comissão" 
                  value={bet.commission} 
                  onChange={(v: string) => updateBet(index, 'commission', Utils.parseFlex(v))} 
                  suffix="%"
                  placeholder="0"
                />
                
                <div className="flex flex-col gap-1.5 min-w-[80px]">
                  <label className="text-[7px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tipo</label>
                  <button 
                    onClick={() => updateBet(index, 'isLay', !bet.isLay)}
                    className={cn(
                      "h-[38px] px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                      bet.isLay 
                        ? "bg-red-500/10 text-red-500 border-red-500/20" 
                        : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                    )}
                  >
                    {bet.isLay ? 'LAY' : 'BACK'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {strategy === 'cashback' && (
            <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02]">
              <InputField 
                label="Taxa de Cashback / Reembolso" 
                value={cashbackRate} 
                onChange={(v: string) => setCashbackRate(Utils.parseFlex(v))} 
                suffix="%"
              />
            </div>
          )}
        </div>

        {/* RESULTADOS - COLUNA DA DIREITA */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="glass-panel p-6 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Análise de Lucro</h3>
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Performance Calculada</p>
              </div>
            </div>

            {result ? (
              <div className="space-y-6">
                
                {/* STAKES RECOMENDADAS */}
                <div className="space-y-3">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Stakes Sugeridas</p>
                  <div className="space-y-2">
                    {result.stakes.map((stake, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/[0.07] transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-zinc-600 font-mono">#{i+1}</span>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {i === 0 ? "Aposta" : "Cobertura"}
                          </span>
                        </div>
                        <span className="text-sm font-black text-white font-mono tracking-tighter">
                          {Utils.formatCurrency(stake || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MÉTRICAS CHAVE */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-black border border-zinc-900 rounded-2xl flex flex-col gap-1 shadow-inner">
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Investimento</span>
                    <span className="text-base font-black text-white font-mono tracking-tighter">
                      {Utils.formatCurrency(result.totalInvestment)}
                    </span>
                  </div>
                  <div className="p-4 bg-black border border-zinc-900 rounded-2xl flex flex-col gap-1 shadow-inner">
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">ROI</span>
                    <span className={cn(
                      "text-base font-black font-mono tracking-tighter",
                      result.roi >= 0 ? "text-profit" : "text-red-500"
                    )}>
                      {Utils.formatPercent(result.roi)}
                    </span>
                  </div>
                </div>

                {/* LUCRO GARANTIDO DESTAQUE */}
                <div className="relative group p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-[2rem] overflow-hidden text-center">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                   <p className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-2">Lucro Líquido Garantido</p>
                   <p className={cn(
                     "text-4xl font-black font-mono tracking-tighter text-glow-profit",
                     result.guaranteedProfit >= 0 ? "text-profit" : "text-red-500"
                   )}>
                     {Utils.formatCurrency(result.guaranteedProfit)}
                   </p>
                   <div className="mt-4 flex items-center justify-center gap-2">
                     <ShieldCheck size={12} className="text-profit" />
                     <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Cálculo de Arbitragem Verificado</span>
                   </div>
                </div>

                <button className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cyan-500 transition-all flex items-center justify-center gap-3">
                  <RefreshCw size={14} />
                  Atualizar Operação
                </button>

              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-30">
                <div className="p-4 bg-zinc-900 rounded-full">
                  <Info size={32} className="text-zinc-700" />
                </div>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest max-w-[150px]">
                  Insira as Odds e a Stake fixa para visualizar a análise.
                </p>
              </div>
            )}
          </div>
          
          <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-zinc-950/30">
             <div className="flex items-center gap-3 text-zinc-600">
               <Info size={14} className="shrink-0" />
               <p className="text-[8px] font-medium leading-relaxed uppercase tracking-tight italic">
                 A calculadora de Arbitragem Elite utiliza nivelamento de lucro (Dutching) para garantir o retorno independentemente do resultado final da partida.
               </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- ICONES ADICIONAIS ---
const GiftIcon = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </svg>
);

export default Calculadora;
