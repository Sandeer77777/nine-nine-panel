import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calculator, Trash2, Zap, Percent, ArrowRightLeft, 
  Rocket, PlusCircle, Check, Gift, Link as LinkIcon, 
  Download, Settings2, ChevronDown, RefreshCcw, SlidersHorizontal, Plus, 
  Lock, Unlock, LayoutGrid
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { useData } from '../services/useData';
import toast from 'react-hot-toast';

interface EntradaState {
  id: string; casa: string; mercado: string; stake: string; odd: string; retorno: string; lucro: string; isPromo: boolean; isRainbow: boolean; valorReembolso: string; taxaExtracao: string; comissao: string; percentualBoost: string; oddFinal: string; showCommission: boolean; showBoost: boolean; isLay: boolean; isLocked?: boolean; responsabilidade?: string | null; deficit?: string | null;
}

interface AddFaseModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (entradas: any[], resumo: { lucro: number; investido: number; retorno: number }) => void;
  faseIndex?: number;
  estrategiaOperacao: string;
  faseParaEditar?: any;
}

const clean = (val: any) => { if (!val) return 0; const str = String(val).replace(',', '.'); const num = parseFloat(str); return isNaN(num) ? 0 : num; };

const CardEntrada = ({ entrada, index, onUpdate, onRemove, casasDisponiveis }: {
    entrada: EntradaState;
    index: number;
    onUpdate: (idx: number, field: keyof EntradaState, val: any) => void;
    onRemove: (idx: number) => void;
    casasDisponiveis: any[];
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const inputClass = "w-full h-8 sm:h-9 bg-[#0f172a] border border-slate-700/60 rounded-lg px-1.5 sm:px-2 text-[10px] sm:text-sm text-white focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder-slate-600 transition-all font-medium";
    const labelTextClass = "text-[7px] sm:text-[9px] font-black text-slate-600 uppercase tracking-tight sm:tracking-widest ml-1";
    
    // RESTAURANDO BRILHOS E CORES ORIGINAIS (SLATE/CYAN)
    let borderClass = 'border-slate-800';
    if (entrada.isLocked) borderClass = 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
    else if (entrada.isLay) borderClass = 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
    else if (entrada.isPromo) borderClass = 'border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.15)]';
    else if (entrada.isRainbow) borderClass = 'border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]';
    else if (entrada.showBoost) borderClass = 'border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]';

    return (
      <div className={`p-2 sm:p-3 bg-slate-900/90 backdrop-blur-sm rounded-xl border-2 ${borderClass} relative transition-all duration-500 flex flex-col shadow-2xl`}>
        <div className="flex justify-between items-center mb-1 sm:mb-2 pb-1 border-b border-white/5">
            <div className="flex items-center gap-1 sm:gap-2">
                <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.25em] ${entrada.isLay ? 'text-red-500' : 'text-cyan-500'}`}>Casa {index + 1}</span>
                {entrada.isLay && <div className="w-1 h-1 rounded-full bg-red-500 animate-ping" />}
                {entrada.isLocked && <Lock size={8} className="text-amber-500 animate-pulse" />}
            </div>
            {index > 0 && <button type="button" onClick={() => onRemove(index)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={10} /></button>}
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="space-y-0.5"><label className={labelTextClass}>Casa</label><select value={entrada.casa} onChange={e => onUpdate(index, 'casa', e.target.value)} className={inputClass}><option value="">Sel...</option>{casasDisponiveis?.map((casa: any) => (<option key={casa.id} value={casa.nome}>{casa.nome}</option>))}</select></div>
            <div className="space-y-0.5"><label className={labelTextClass}>Mercado</label><input type="text" value={entrada.mercado} onChange={e => onUpdate(index, 'mercado', e.target.value)} className={inputClass} placeholder="Ex: Over" /></div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="space-y-0.5"><label className={labelTextClass}>Odd</label><input type="text" value={entrada.odd} onChange={e => onUpdate(index, 'odd', e.target.value)} className={`${inputClass} font-mono ${entrada.isLay ? 'bg-red-500/10 border-red-500/40 text-red-100 focus:ring-red-500' : ''}`} placeholder="2.00" /></div>
            <div className="space-y-0.5"><label className={labelTextClass}>Odd Real</label><div className="w-full h-8 sm:h-9 bg-black/40 border border-slate-800/50 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black font-mono text-cyan-400 shadow-inner">{(() => { const oBase = clean(entrada.odd); const boost = clean(entrada.percentualBoost) / 100; const com = clean(entrada.comissao) / 100; let oFinal = oBase; if (boost > 0 && !entrada.isLay) oFinal = oBase + ((oBase - 1) * boost); let res = entrada.isLay ? oBase : entrada.isPromo ? (oFinal - 1) * (1 - com) : 1 + ((oFinal - 1) * (1 - com)); return res > 0 ? res.toFixed(2) : '0.00'; })()}</div></div>
        </div>

        <div className="space-y-0.5 mb-2 sm:mb-3">
            <div className="flex justify-between items-center px-1"><label className={labelTextClass}>Stake {entrada.isPromo ? "(Free)" : ""}</label></div>
            <div className="flex gap-1.5 sm:gap-2 h-8 sm:h-9">
                <div className="relative flex-1 h-full"><span className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-[8px] sm:text-[10px]">R$</span><input type="text" value={entrada.stake} onChange={e => onUpdate(index, 'stake', e.target.value)} className={`${inputClass} pl-5 sm:pl-7 font-mono ${entrada.isPromo ? 'text-yellow-400 border-yellow-500/30' : entrada.isRainbow ? 'text-purple-400 border-purple-500/30' : ''}`} placeholder="100" /></div>
                <button type="button" onClick={() => onUpdate(index, 'isLay', !entrada.isLay)} className={`h-full px-2 sm:px-4 rounded-lg border font-black text-[7px] sm:text-[8px] uppercase italic tracking-tight sm:tracking-wider transition-all duration-500 flex items-center gap-1 sm:gap-2 active:scale-95 ${entrada.isLay ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-105' : 'bg-slate-900 border-slate-800 text-slate-600'}`}><ArrowRightLeft size={10} className={`${entrada.isLay ? 'rotate-180' : ''} transition-transform duration-500`} /> LAY</button>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 mb-2">
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className={`flex-1 h-7 sm:h-8 flex items-center justify-center gap-1.5 rounded-lg border text-[7px] sm:text-[9px] font-bold uppercase transition-all ${showAdvanced ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}><SlidersHorizontal size={8} /> AJUSTES {showAdvanced ? <ChevronDown size={8} className="rotate-180" /> : <ChevronDown size={8} />}</button>
            <button type="button" onClick={() => onUpdate(index, 'isLocked', !entrada.isLocked)} className={`flex-1 h-7 sm:h-8 flex items-center justify-center gap-1.5 rounded-lg border text-[7px] sm:text-[9px] font-bold uppercase transition-all ${entrada.isLocked ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}>
                {entrada.isLocked ? <Lock size={8} /> : <Unlock size={8} />} {entrada.isLocked ? 'FIXADO' : 'FIXAR'}
            </button>
        </div>

        {showAdvanced && (
            <div className="space-y-1.5 sm:space-y-2 pt-1.5 sm:pt-2 border-t border-white/5 animate-in fade-in slide-in-from-top-1">
                <div className="grid grid-cols-2 gap-1 sm:gap-1.5 overflow-hidden">
                    <button type="button" onClick={() => onUpdate(index, 'isPromo', !entrada.isPromo)} className={`h-7 sm:h-8 border transition-all rounded-lg text-[7px] sm:text-[8px] font-bold uppercase flex items-center justify-center gap-1 sm:gap-1.5 ${entrada.isPromo ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-slate-800/30 border-slate-700/30 text-slate-600'}`}><Gift size={8} className={`${entrada.isPromo ? 'animate-gift-float' : ''}`} /> <span>Free bet</span></button>
                    <button type="button" onClick={() => onUpdate(index, 'isRainbow', !entrada.isRainbow)} className={`h-7 sm:h-8 border transition-all rounded-lg text-[7px] sm:text-[8px] font-bold uppercase flex items-center justify-center gap-1 sm:gap-1.5 ${entrada.isRainbow ? 'bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-slate-800/30 border-slate-700/30 text-slate-600'}`}><RefreshCcw size={8} className={`${entrada.isRainbow ? 'rotate-[-180deg]' : ''} transition-transform duration-500`} /> <span>Reemb</span></button>
                    <button type="button" onClick={() => onUpdate(index, 'showBoost', !entrada.showBoost)} className={`h-7 sm:h-8 border transition-all rounded-lg text-[7px] sm:text-[8px] font-bold uppercase flex items-center justify-center gap-1 sm:gap-1.5 relative overflow-hidden ${entrada.showBoost ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-slate-800/30 border-slate-700/30 text-slate-600'}`}><Rocket size={8} className={`${entrada.showBoost ? 'animate-rocket-snake' : ''}`} /> <span>Boost</span></button>
                    <button type="button" onClick={() => onUpdate(index, 'showCommission', !entrada.showCommission)} className={`h-7 sm:h-8 border transition-all rounded-lg text-[7px] sm:text-[8px] font-bold uppercase flex items-center justify-center gap-1 sm:gap-1.5 ${entrada.showCommission ? 'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-800/30 border-slate-700/30 text-slate-600'}`}><Percent size={8} className={`${entrada.showCommission ? 'rotate-[360deg]' : ''} transition-transform duration-700`} /> <span>Com</span></button>
                </div>
                {entrada.isRainbow && (<div className="grid grid-cols-2 gap-1.5 p-1 bg-purple-500/5 rounded-lg border border-purple-500/10 animate-in zoom-in-95 duration-200"><div className="space-y-0.5"><label className={labelTextClass}>Reemb.</label><input type="text" value={entrada.valorReembolso} onChange={e => onUpdate(index, 'valorReembolso', e.target.value)} className={inputClass} placeholder="100" /></div><div className="space-y-0.5"><label className={labelTextClass}>Taxa %</label><input type="text" value={entrada.taxaExtracao} onChange={e => onUpdate(index, 'taxaExtracao', e.target.value)} className={inputClass} placeholder="70" /></div></div>)}
                {entrada.showBoost && (<div className="space-y-0.5 animate-in slide-in-from-left-2 duration-200"><label className={labelTextClass}>Boost %</label><input type="text" value={entrada.percentualBoost} onChange={e => onUpdate(index, 'percentualBoost', e.target.value)} className={inputClass} placeholder="25" /></div>)}
                {entrada.showCommission && (<div className="space-y-0.5 animate-in slide-in-from-right-2 duration-200"><label className={labelTextClass}>Com. %</label><input type="text" value={entrada.comissao} onChange={e => onUpdate(index, 'comissao', e.target.value)} className={inputClass} placeholder="6.5" /></div>)}
            </div>
        )}
      </div>
    );
};

export const AddFaseModal: React.FC<AddFaseModalProps> = ({ isOpen = true, onClose, onSave, faseIndex, estrategiaOperacao, faseParaEditar }) => {
  const { casasApostas } = useData(); 
  const [entradas, setEntradas] = useState<EntradaState[]>([]); 
  const [importUrl, setImportUrl] = useState(''); 
  const [arredondamento, setArredondamento] = useState<number>(0.01);
  const [showArredondarMenu, setShowArredondarMenu] = useState(false);
  
  useEffect(() => { if (isOpen && !faseParaEditar) {
    const isRainbowDefault = estrategiaOperacao === 'rainbow';
    setEntradas([{
      id: nanoid(), casa: '', mercado: '', odd: '', stake: '', comissao: '',
      isPromo: false, isRainbow: isRainbowDefault, isLay: false, showCommission: false, 
      showBoost: false, percentualBoost: '', valorReembolso: isRainbowDefault ? '100' : '',
      taxaExtracao: isRainbowDefault ? '70' : '', oddFinal: '', lucro: '', retorno: '',
      isLocked: true 
    }, {
      id: nanoid(), casa: '', mercado: '', odd: '', stake: '', comissao: '',
      isPromo: false, isRainbow: false, isLay: false, showCommission: false, showBoost: false,
      percentualBoost: '', valorReembolso: '', taxaExtracao: '', oddFinal: '', lucro: '', retorno: '',
      isLocked: false
    }]); setImportUrl(''); } }, [isOpen, faseParaEditar, estrategiaOperacao]);

  useEffect(() => { if (faseParaEditar && (faseParaEditar.entradas || faseParaEditar.fases)) { const listaEntradas = faseParaEditar.entradas || []; if(listaEntradas.length > 0) { const dados = listaEntradas.map((e: any, idx: number) => ({
      id: nanoid(), ...e,
      stake: e.stake ? String(e.stake) : '',
      odd: e.odd ? String(e.odd) : '',
      isRainbow: !!e.isRainbow,
      isPromo: !!e.isPromo,
      percentualBoost: e.percentualBoost ? String(e.percentualBoost) : '',
      comissao: e.comissao ? String(e.comissao) : '',
      valorReembolso: e.valorReembolso ? String(e.valorReembolso) : '',
      taxaExtracao: e.taxaExtracao ? String(e.taxaExtracao) : '',
      isLay: !!e.isLay,
      showBoost: !!e.percentualBoost,
      showCommission: !!e.comissao,
      isLocked: idx === 0 
  })); setEntradas(dados); } } }, [faseParaEditar]);

  const calculateStakes = (entradasAtuais: EntradaState[]) => {
    if (entradasAtuais.length === 0) return entradasAtuais;
    let ancora = entradasAtuais.find(e => e.isLocked && clean(e.stake) > 0);
    if (!ancora) ancora = entradasAtuais[0];
    if (!ancora || !ancora.stake || clean(ancora.stake) <= 0) return entradasAtuais;

    const entradasComOdds = entradasAtuais.map(item => {
      const oddBase = clean(item.odd);
      const comissao = clean(item.comissao) / 100;
      const boost = clean(item.percentualBoost) / 100;
      let oddFinal = oddBase;
      let oddParaCalculo = oddBase;
      if (item.isLay) { if (oddBase > 0) oddParaCalculo = oddBase - comissao; } else { if (boost > 0) oddFinal = oddBase + ((oddBase - 1) * boost); if (item.isPromo) oddParaCalculo = (oddFinal - 1) * (1 - comissao); else oddParaCalculo = 1 + ((oddFinal - 1) * (1 - comissao)); }
      return { ...item, oddFinal: oddFinal > 0 ? oddFinal.toFixed(2) : '', oddParaCalculo };
    });

    const ancoraCalc = entradasComOdds.find(e => e.id === ancora?.id);
    if (!ancoraCalc || ancoraCalc.oddParaCalculo <= 0) return entradasAtuais;
    const refundAncora = ancoraCalc.isRainbow ? clean(ancoraCalc.valorReembolso) * (clean(ancoraCalc.taxaExtracao) / 100) : 0;
    const retornoAlvo = (clean(ancoraCalc.stake) * ancoraCalc.oddParaCalculo) - refundAncora;

    return entradasComOdds.map((item) => {
      if (item.isLocked) return item;
      if (item.oddParaCalculo > 0) {
        let novaStake = retornoAlvo / item.oddParaCalculo;
        if (arredondamento > 0.001) novaStake = Math.round(novaStake / arredondamento) * arredondamento;
        return { ...item, stake: novaStake.toFixed(2) };
      }
      return item;
    });
  };

  useEffect(() => { if (entradas.length === 0) return; const novas = calculateStakes(entradas); const mudou = novas.some((nova, i) => nova.stake !== entradas[i].stake); if (mudou) setEntradas(novas); }, [entradas.map(e => e.stake + e.isLocked).join('|'), entradas.map(e => e.odd + e.percentualBoost + e.comissao + e.isLay + e.isPromo + e.isRainbow).join('|'), arredondamento]);

  const handleUpdate = (index: number, field: keyof EntradaState, value: any) => { 
    setEntradas(prev => { 
      let temp = [...prev]; 
      if (field === 'isLocked' && value === true) { temp = temp.map((ent, i) => ({ ...ent, isLocked: i === index })); } else { temp[index] = { ...temp[index], [field]: value }; }
      if (field === 'isPromo' && value === true) { temp[index].isRainbow = false; } 
      if (field === 'isRainbow' && value === true) { temp[index].isPromo = false; } 
      return temp; 
    }); 
  };

  const handleRemove = (index: number) => { if(entradas.length > 1) setEntradas(prev => prev.filter((_, i) => i !== index)); };
  const handleAdd = () => { setEntradas(prev => [...prev, { id: nanoid(), casa: '', mercado: '', odd: '', stake: '', comissao: '', isPromo: false, isRainbow: false, isLay: false, showCommission: false, showBoost: false, percentualBoost: '', valorReembolso: '', taxaExtracao: '', oddFinal: '', lucro: '', retorno: '', isLocked: false }]); };
  
  const handleImportUrl = () => {
    try {
      if (!importUrl) return;
      const urlObj = new URL(importUrl.trim());
      const params = new URLSearchParams(urlObj.search);
      let dataJson = params.get('entries') || params.get('h');
      if (!dataJson) return;
      const entries = JSON.parse(decodeURIComponent(dataJson));
      if (Array.isArray(entries) && entries.length > 0) {
        setEntradas(entries.map((item: any, idx: number) => ({ id: nanoid(), casa: '', mercado: '', odd: String(item.o || '').replace(',', '.'), stake: String(item.s || '').replace(',', '.'), comissao: String(item.c || '').replace(',', '.'), isPromo: Number(item.f) === 1, isLay: Number(item.l) === 1, isRainbow: !!item.re, valorReembolso: String(item.re || ''), taxaExtracao: '70', showCommission: !!item.c, showBoost: !!item.b, percentualBoost: String(item.b || ''), isLocked: idx === 0, oddFinal: '', lucro: '', retorno: '' }))); setImportUrl(''); toast.success("Importado!");
      }
    } catch (e) { toast.error("Erro ao importar."); }
  };

  if (!isOpen) return null;
  const entradasRender = entradas.map(item => { const oddBase = clean(item.odd); let oddFinal = oddBase; let oddParaCalculo = oddBase; const comissao = clean(item.comissao) / 100; const boost = clean(item.percentualBoost) / 100; let investimento = clean(item.stake); if (item.isLay) { if (oddBase > 0) { oddParaCalculo = oddBase - comissao; investimento = clean(item.stake) * (oddBase - 1); } } else { if (boost > 0) oddFinal = oddBase + ((oddBase - 1) * boost); if (item.isPromo) { oddParaCalculo = (oddFinal - 1) * (1 - comissao); investimento = 0; } else { oddParaCalculo = 1 + ((oddFinal - 1) * (1 - comissao)); } } return { ...item, oddFinalDisplay: oddFinal > 0 ? oddFinal.toFixed(2) : '-', oddParaCalculo, investimento, cleanStake: clean(item.stake) }; });
  const totalInv = entradasRender.reduce((acc, cur) => acc + cur.investimento, 0);
  const lucros = entradasRender.map((itemV, idx) => { const ret = itemV.cleanStake * itemV.oddParaCalculo; const refund = entradasRender.reduce((acc, it, i) => (i === idx ? acc : acc + (it.isRainbow ? clean(it.valorReembolso) * (clean(it.taxaExtracao) / 100) : 0)), 0); return ret - totalInv + refund; });
  const totalLucro = Math.min(...lucros);
  const roi = totalInv > 0 ? (totalLucro / totalInv) * 100 : 0;

  const handleSalvarComCalculos = () => { 
    const dados = entradasRender.map(item => ({ ...item, lucro: (item.cleanStake * item.oddParaCalculo - totalInv).toFixed(2), retorno: (item.cleanStake * item.oddParaCalculo).toFixed(2) })); 
    onSave(dados, { lucro: totalLucro, investido: totalInv, retorno: totalLucro + totalInv }); 
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-4 overflow-y-auto">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <div className="relative z-10 bg-slate-950 w-full max-w-[1200px] rounded-[3rem] shadow-2xl border border-zinc-900 flex flex-col max-h-[98vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-zinc-900 bg-slate-900/50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Calculator size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tight leading-none">Calculadora</h2>
                <p className="text-[7px] sm:text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1">Enterprise Suite</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 sm:p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all border border-zinc-800 relative shadow-lg">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 w-full">
            <div className="flex flex-1 items-center gap-2 w-full">
              <div className="relative flex-1 group">
                <div className="absolute -inset-px bg-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center bg-black border border-zinc-800 rounded-xl hover:border-cyan-500/40 transition-colors">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-zinc-700" />
                  <input type="text" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="COLE O LINK..." className="w-full bg-transparent border-none rounded-xl pl-8 sm:pl-10 pr-4 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white focus:ring-0 placeholder-zinc-800" />
                </div>
              </div>
              <button onClick={handleImportUrl} disabled={!importUrl} className="h-9 sm:h-11 px-4 sm:px-6 bg-zinc-900 hover:bg-cyan-500 hover:text-black disabled:opacity-30 text-zinc-400 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl min-w-max">Importar</button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                <div onClick={handleAdd} className="relative group flex-1 md:w-36 cursor-pointer active:scale-95 transition-all">
                    <div className="absolute -inset-px bg-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative flex items-center gap-2.5 bg-black px-3 py-1.5 sm:py-2 rounded-xl border border-zinc-800 group-hover:border-cyan-500/40 transition-colors h-9 sm:h-11">
                        <div className="p-1 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300">
                            <Plus size={12} strokeWidth={4} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[6px] sm:text-[7px] font-black text-zinc-700 uppercase tracking-tighter leading-none mb-0.5">Adicionar</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-white whitespace-nowrap">{entradas.length} Casas</span>
                        </div>
                    </div>
                </div>

                <div className="relative group flex-1 md:w-40">
                    <div className="absolute -inset-px bg-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <button onClick={() => setShowArredondarMenu(!showArredondarMenu)} className="relative flex items-center gap-2 bg-black px-3 py-1.5 sm:py-2 rounded-xl border border-zinc-800 hover:border-indigo-500/40 transition-colors cursor-pointer h-9 sm:h-11 w-full">
                        <Settings2 size={14} className="text-indigo-400" />
                        <div className="flex flex-col flex-1 items-start">
                            <span className="text-[6px] sm:text-[7px] font-black text-zinc-700 uppercase leading-none">Arredondar</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-white">R$ {arredondamento.toFixed(2)}</span>
                        </div>
                        <ChevronDown size={12} className={`text-slate-500 transition-transform ${showArredondarMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showArredondarMenu && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setShowArredondarMenu(false)} />
                            <div className="absolute top-full right-0 mt-2 w-full bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden z-[120] shadow-2xl">
                                {[0.01, 0.10, 0.50, 1.00].map((val) => (
                                    <button key={val} onClick={() => { setArredondamento(val); setShowArredondarMenu(false); }} className={`w-full px-4 py-3 text-left text-[10px] font-black uppercase transition-colors flex items-center justify-between ${arredondamento === val ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:bg-white/5'}`}>
                                        <span>R$ {val.toFixed(2)}</span>
                                        {arredondamento === val && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-black/20">
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
            {entradas.map((entrada, index) => (
              <CardEntrada key={entrada.id} entrada={entrada} index={index} onUpdate={handleUpdate} onRemove={handleRemove} casasDisponiveis={casasApostas || []} />
            ))}
          </div>
          
          <div className="mt-3 sm:mt-8 bg-[#0E0E10] p-2 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-zinc-900 shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar rounded-lg border border-zinc-800 bg-black/40">
              <table className="w-full text-left text-[6px] sm:text-[9px] border-collapse min-w-[400px] sm:min-w-full">
                <thead className="bg-black/80 border-b border-zinc-900 text-[7px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-tight sm:tracking-widest">
                  <tr>
                    <th className="px-2 py-1 sm:px-8 sm:py-6">Cenário</th>
                    <th className="px-1 py-1 sm:px-4 sm:py-6 text-center">Odd</th>
                    <th className="px-1 py-1 sm:px-4 sm:py-6 text-center">Stake</th>
                    <th className="px-2 py-1 sm:px-8 sm:py-6 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 bg-black/20">
                  {entradasRender.map((item, index) => {
                    const lucroCen = lucros[index];
                    return (<tr key={index} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-2 py-1 sm:px-8 sm:py-6">
                        <span className="text-[10px] sm:text-base font-black text-white uppercase italic leading-tight">{item.casa || `Casa ${index + 1}`}</span>
                        <div className="flex gap-1 mt-0">
                          {item.isPromo && <span className="text-[5px] sm:text-[8px] px-1 py-0 rounded-sm font-black uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Free</span>}
                          {item.isRainbow && <span className="text-[5px] sm:text-[8px] px-1 py-0 rounded-sm font-black uppercase border bg-purple-500/10 text-purple-400 border-purple-500/20">Reemb</span>}
                        </div>
                      </td>
                      <td className="px-1 py-1 sm:px-4 sm:py-6 text-center font-mono text-[10px] sm:text-base text-zinc-500 leading-none">{item.oddFinalDisplay}</td>
                      <td className="px-1 py-1 sm:px-4 sm:py-6 text-center font-mono text-[10px] sm:text-base text-zinc-300 leading-none">R${item.cleanStake.toFixed(2)}</td>
                      <td className={`px-2 py-1 sm:px-8 sm:py-6 text-right font-black text-sm sm:text-2xl ${lucroCen >= 0 ? 'text-emerald-400' : 'text-red-400'} leading-none`}>{lucroCen >= 0 ? '+' : ''}R$ {lucroCen.toFixed(2)}</td>
                    </tr>);
                  })}
                </tbody>
                <tfoot className="bg-black/80 border-t border-zinc-900">
                  <tr>
                    <td className="px-2 py-3 sm:px-4 sm:py-6" colSpan={2}>
                        <div className="flex gap-3 sm:gap-6">
                            <div className="flex flex-col">
                                <span className="text-[5px] sm:text-[8px] text-zinc-600 font-black uppercase">ROI</span>
                                <span className={`text-[10px] sm:text-xl font-black font-mono ${roi >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>{roi.toFixed(2)}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[5px] sm:text-[8px] text-zinc-600 font-black uppercase">Investido</span>
                                <span className="text-[10px] sm:text-xl font-black text-zinc-300">R${totalInv.toFixed(2)}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-6 text-right" colSpan={2}>
                      <div className="flex flex-col items-end">
                        <span className="text-[5px] sm:text-[8px] text-zinc-600 font-black uppercase">Mínimo</span>
                        <div className={`text-base sm:text-3xl font-black ${totalLucro >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>R$ {totalLucro.toFixed(2)}</div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="shrink-0 pt-6 mt-6 border-t border-zinc-900 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-12 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all shadow-lg">Cancelar</button>
            <button type="button" onClick={handleSalvarComCalculos} className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
              <Check size={16} /> Confirmar Operação 🔥
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};
export default AddFaseModal;
