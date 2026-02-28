import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calculator, Trash2, Zap, Percent, ArrowRightLeft, 
  Rocket, PlusCircle, Check, Gift, Link as LinkIcon, 
  Download, Settings2, ChevronDown, RefreshCcw, SlidersHorizontal
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { useData } from '../services/useData';
import toast from 'react-hot-toast';

interface EntradaState {
  id: string; casa: string; mercado: string; stake: string; odd: string; retorno: string; lucro: string; isPromo: boolean; isRainbow: boolean; valorReembolso: string; taxaExtracao: string; comissao: string; percentualBoost: string; oddFinal: string; showCommission: boolean; showBoost: boolean; isLay: boolean; responsabilidade?: string | null; deficit?: string | null;
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
    const inputClass = "w-full h-9 bg-[#0f172a] border border-slate-700/60 rounded-lg px-2 text-sm text-white focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder-slate-600 transition-all font-medium";
    const labelTextClass = "text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1";
    let borderClass = 'border-slate-800';
    if (entrada.isLay) borderClass = 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
    else if (entrada.isPromo) borderClass = 'border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.15)]';
    else if (entrada.isRainbow) borderClass = 'border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]';
    else if (entrada.showBoost) borderClass = 'border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]';

    return (
      <div className={`p-3 bg-slate-900/90 backdrop-blur-sm rounded-xl border-2 ${borderClass} relative transition-all duration-500 flex flex-col shadow-2xl`}>
        <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/5">
            <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${entrada.isLay ? 'text-red-500' : 'text-cyan-500'}`}>Casa {index + 1}</span>
                {entrada.isLay && <div className="w-1 h-1 rounded-full bg-red-500 animate-ping" />}
            </div>
            {index > 0 && <button type="button" onClick={() => onRemove(index)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="space-y-0.5"><label className={labelTextClass}>Casa</label><select value={entrada.casa} onChange={e => onUpdate(index, 'casa', e.target.value)} className={inputClass}><option value="">Selecione...</option>{casasDisponiveis?.map((casa: any) => (<option key={casa.id} value={casa.nome}>{casa.nome}</option>))}</select></div>
            <div className="space-y-0.5"><label className={labelTextClass}>Mercado</label><input type="text" value={entrada.mercado} onChange={e => onUpdate(index, 'mercado', e.target.value)} className={inputClass} placeholder="Ex: Over 2.5" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="space-y-0.5"><label className={labelTextClass}>Odd</label><input type="text" value={entrada.odd} onChange={e => onUpdate(index, 'odd', e.target.value)} className={`${inputClass} font-mono ${entrada.isLay ? 'bg-red-500/10 border-red-500/40 text-red-100 focus:ring-red-500' : ''}`} placeholder="2.00" /></div>
            <div className="space-y-0.5"><label className={labelTextClass}>Odd Real</label><div className="w-full h-9 bg-black/40 border border-slate-800/50 rounded-lg flex items-center justify-center text-xs font-black font-mono text-cyan-400 shadow-inner">{(() => { const oBase = clean(entrada.odd); const boost = clean(entrada.percentualBoost) / 100; const com = clean(entrada.comissao) / 100; let oFinal = oBase; if (boost > 0 && !entrada.isLay) oFinal = oBase + ((oBase - 1) * boost); let res = entrada.isLay ? oBase : entrada.isPromo ? (oFinal - 1) * (1 - com) : 1 + ((oFinal - 1) * (1 - com)); return res > 0 ? res.toFixed(2) : '0.00'; })()}</div></div>
        </div>
        <div className="space-y-0.5 mb-3">
            <div className="flex justify-between items-center px-1"><label className={labelTextClass}>Stake {entrada.isPromo ? "(Free bet)" : ""}</label></div>
            <div className="flex gap-2 h-9">
                <div className="relative flex-1 h-full"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-[10px]">R$</span><input type="text" value={entrada.stake} onChange={e => onUpdate(index, 'stake', e.target.value)} className={`${inputClass} pl-7 font-mono ${entrada.isPromo ? 'text-yellow-400 border-yellow-500/30' : entrada.isRainbow ? 'text-purple-400 border-purple-500/30' : ''}`} placeholder="100.00" /></div>
                <button type="button" onClick={() => onUpdate(index, 'isLay', !entrada.isLay)} className={`h-full px-4 rounded-lg border font-black text-[8px] uppercase italic tracking-wider transition-all duration-500 flex items-center gap-2 active:scale-95 ${entrada.isLay ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-105' : 'bg-slate-900 border-slate-800 text-slate-600'}`}><ArrowRightLeft size={12} className={`${entrada.isLay ? 'rotate-180' : ''} transition-transform duration-500`} /> LAY</button>
            </div>
        </div>
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className={`w-full h-8 flex items-center justify-center gap-2 rounded-lg border text-[9px] font-bold uppercase transition-all ${showAdvanced ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}><SlidersHorizontal size={10} /> AJUSTES TÁTICOS {showAdvanced ? <ChevronDown size={10} className="rotate-180" /> : <ChevronDown size={10} />}</button>
        {showAdvanced && (
            <div className="space-y-2 pt-2 border-t border-white/5 animate-in fade-in slide-in-from-top-1">
                <div className="grid grid-cols-2 gap-1.5 overflow-hidden">
                    <button type="button" onClick={() => onUpdate(index, 'isPromo', !entrada.isPromo)} className={`h-8 border transition-all rounded-lg text-[8px] font-bold uppercase flex items-center justify-center gap-1.5 ${entrada.isPromo ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-slate-800/30 border-slate-700/30 text-slate-600'}`}><Gift size={10} className={`${entrada.isPromo ? 'animate-gift-float' : ''}`} /> <span>Free bet</span></button>
                    <button type="button" onClick={() => onUpdate(index, 'isRainbow', !entrada.isRainbow)} className={`h-8 border transition-all rounded-lg text-[8px] font-bold uppercase flex items-center justify-center gap-1.5 ${entrada.isRainbow ? 'bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-slate-800/30 border-slate-700/30 text-slate-600'}`}><RefreshCcw size={10} className={`${entrada.isRainbow ? 'rotate-[-180deg]' : ''} transition-transform duration-500`} /> <span>Reembolso</span></button>
                    <button type="button" onClick={() => onUpdate(index, 'showBoost', !entrada.showBoost)} className={`h-8 border transition-all rounded-lg text-[8px] font-bold uppercase flex items-center justify-center gap-1.5 relative overflow-hidden ${entrada.showBoost ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-slate-800/30 border-slate-700/30 text-slate-600'}`}><Rocket size={10} className={`${entrada.showBoost ? 'animate-rocket-snake' : ''}`} /> <span>Aumento</span></button>
                    <button type="button" onClick={() => onUpdate(index, 'showCommission', !entrada.showCommission)} className={`h-8 border transition-all rounded-lg text-[8px] font-bold uppercase flex items-center justify-center gap-1.5 ${entrada.showCommission ? 'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-800/30 border-slate-700/30 text-slate-600'}`}><Percent size={10} className={`${entrada.showCommission ? 'rotate-[360deg]' : ''} transition-transform duration-700`} /> <span>Comissão</span></button>
                </div>
                {entrada.isRainbow && (<div className="grid grid-cols-2 gap-2 p-1.5 bg-purple-500/5 rounded-lg border border-purple-500/10 animate-in zoom-in-95 duration-200"><div className="space-y-0.5"><label className={labelTextClass}>Reemb.</label><input type="text" value={entrada.valorReembolso} onChange={e => onUpdate(index, 'valorReembolso', e.target.value)} className={inputClass} placeholder="100.00" /></div><div className="space-y-0.5"><label className={labelTextClass}>Taxa %</label><input type="text" value={entrada.taxaExtracao} onChange={e => onUpdate(index, 'taxaExtracao', e.target.value)} className={inputClass} placeholder="70" /></div></div>)}
                {entrada.showBoost && (<div className="space-y-0.5 animate-in slide-in-from-left-2 duration-200"><label className={labelTextClass}>Boost %</label><input type="text" value={entrada.percentualBoost} onChange={e => onUpdate(index, 'percentualBoost', e.target.value)} className={inputClass} placeholder="25" /></div>)}
                {entrada.showCommission && (<div className="space-y-0.5 animate-in slide-in-from-right-2 duration-200"><label className={labelTextClass}>Com. %</label><input type="text" value={entrada.comissao} onChange={e => onUpdate(index, 'comissao', e.target.value)} className={inputClass} placeholder="6.5" /></div>)}
            </div>
        )}
      </div>
    );
};

export const AddFaseModal: React.FC<AddFaseModalProps> = ({ isOpen = true, onClose, onSave, faseIndex, estrategiaOperacao, faseParaEditar }) => {
  const { casasApostas } = useData(); const [entradas, setEntradas] = useState<EntradaState[]>([]); const [importUrl, setImportUrl] = useState(''); const [arredondamento, setArredondamento] = useState<number>(0.01);
  
  useEffect(() => { if (isOpen && !faseParaEditar) {
    const isRainbowDefault = estrategiaOperacao === 'rainbow';
    setEntradas([{
      id: nanoid(), casa: '', mercado: '', odd: '', stake: '', comissao: '',
      isPromo: false, 
      isRainbow: isRainbowDefault,
      isLay: false, showCommission: false, showBoost: false, percentualBoost: '',
      valorReembolso: isRainbowDefault ? '100' : '',
      taxaExtracao: isRainbowDefault ? '70' : '',
      oddFinal: '', lucro: '', retorno: ''
    }, {
      id: nanoid(), casa: '', mercado: '', odd: '', stake: '', comissao: '',
      isPromo: false, isRainbow: false, isLay: false, showCommission: false, showBoost: false,
      percentualBoost: '', valorReembolso: '', taxaExtracao: '', oddFinal: '', lucro: '', retorno: ''
    }]); setImportUrl(''); } }, [isOpen, faseParaEditar, estrategiaOperacao]);

  useEffect(() => { if (faseParaEditar && (faseParaEditar.entradas || faseParaEditar.fases)) { const listaEntradas = faseParaEditar.entradas || []; if(listaEntradas.length > 0) { const dados = listaEntradas.map((e: any) => ({
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
      showCommission: !!e.comissao
  })); setEntradas(dados); } } }, [faseParaEditar]);

  const calculateStakes = (entradasAtuais: EntradaState[]) => {
    const mestre = entradasAtuais[0];
    if (!mestre || !mestre.stake || clean(mestre.stake) <= 0) return entradasAtuais;

    const entradasComOdds = entradasAtuais.map(item => {
      const oddBase = clean(item.odd);
      const comissao = clean(item.comissao) / 100;
      const boost = clean(item.percentualBoost) / 100;
      let oddFinal = oddBase;
      let oddParaCalculo = oddBase;

      if (item.isLay) {
        if (oddBase > 0) oddParaCalculo = oddBase - comissao;
      } else {
        if (boost > 0) oddFinal = oddBase + ((oddBase - 1) * boost);
        if (item.isPromo) oddParaCalculo = (oddFinal - 1) * (1 - comissao);
        else oddParaCalculo = 1 + ((oddFinal - 1) * (1 - comissao));
      }
      return { ...item, oddFinal: oddFinal > 0 ? oddFinal.toFixed(2) : '', oddParaCalculo };
    });

    const mestreCalc = entradasComOdds[0];
    if (mestreCalc.oddParaCalculo <= 0) return entradasAtuais;

    const refund1 = mestreCalc.isRainbow ? clean(mestreCalc.valorReembolso) * (clean(mestreCalc.taxaExtracao) / 100) : 0;
    let retornoAlvo = (clean(mestreCalc.stake) * mestreCalc.oddParaCalculo) - refund1;

    return entradasComOdds.map((item, index) => {
      if (index === 0) return item;
      if (item.oddParaCalculo > 0) {
        let novaStake = retornoAlvo / item.oddParaCalculo;
        if (arredondamento > 0.001) novaStake = Math.round(novaStake / arredondamento) * arredondamento;
        return { ...item, stake: novaStake.toFixed(2) };
      }
      return item;
    });
  };

  useEffect(() => { 
    if (entradas.length === 0) return; 
    const novasEntradas = calculateStakes(entradas); 
    const mudou = novasEntradas.some((nova, i) => nova.stake !== entradas[i].stake || nova.oddFinal !== entradas[i].oddFinal); 
    if (mudou) setEntradas(novasEntradas); 
  }, [
    entradas[0]?.stake, 
    entradas.map(e => e.odd + e.percentualBoost + e.comissao + e.isLay + e.isPromo + e.isRainbow + e.valorReembolso + e.taxaExtracao).join('|'), 
    arredondamento
  ]);

  const handleUpdate = (index: number, field: keyof EntradaState, value: any) => { 
    setEntradas(prev => { 
      const temp = [...prev]; 
      temp[index] = { ...temp[index], [field]: value }; 
      if (field === 'isPromo' && value === true) { temp[index].isRainbow = false; } 
      if (field === 'isRainbow' && value === true) { temp[index].isPromo = false; } 
      return temp; 
    }); 
  };

  const handleRemove = (index: number) => { setEntradas(prev => prev.filter((_, i) => i !== index)); };

  const handleAdd = () => { setEntradas(prev => [...prev, { id: nanoid(), casa: '', mercado: '', odd: '', stake: '', comissao: '', isPromo: false, isRainbow: false, isLay: false, showCommission: false, showBoost: false, percentualBoost: '', valorReembolso: '', taxaExtracao: '', oddFinal: '', lucro: '', retorno: '' }]); };
  
  const handleImportUrl = () => {
    try {
      if (!importUrl) return;
      const urlObj = new URL(importUrl.trim());
      const params = new URLSearchParams(urlObj.search);
      
      // Detecção de modo via parâmetro 'mode' ou 'm'
      const rawMode = params.get('mode') || params.get('m') || '';
      const isExplicitFreebetMode = (rawMode === 'freebet' || rawMode === 'extracao');
      
      let roundingParam = params.get('rounding') || params.get('r');
      if (roundingParam) setArredondamento(parseFloat(roundingParam) || 0.01);
      
      const ho = params.get('ho') || '';
      const qs = params.get('qs') || '';
      const faceValueRefund = params.get('fv') || '';
      const extractionRefund = params.get('er') || '70';
      let dataJson = params.get('h') || params.get('entries');
      if (!dataJson) return;
      const hedges = JSON.parse(decodeURIComponent(dataJson));

      const allItems = [];
      if (ho) allItems.push({ o: ho, s: qs, isHead: true });
      if (Array.isArray(hedges)) allItems.push(...hedges);

      if (allItems.length > 0) {
        localStorage.removeItem('99_calc_state_intelligent');
        const novas = allItems.map((item: any, idx: number) => {
          // Detecta Reembolso (Rainbow) na Casa 1:
          const isRainbow = idx === 0 && !!(faceValueRefund || item.re);
          
          // PROIBIÇÃO TOTAL: Só ativa Freebet se:
          // 1. O link tiver o modo explícito (mode=freebet/extracao)
          // 2. O item tiver a flag fs: 1 ou f: 1
          // 3. For a PRIMEIRA casa
          // 4. NÃO for um link de Reembolso
          const itemHasFreebetFlag = Number(item.fs) === 1 || Number(item.f) === 1;
          const finalPromo = (idx === 0) && isExplicitFreebetMode && itemHasFreebetFlag && !isRainbow;

          return {
            id: nanoid(), casa: '', mercado: '',
            odd: item.o ? String(item.o).replace(',', '.') : '',
            stake: item.s ? String(item.s).replace(',', '.') : '',
            comissao: item.c ? String(item.c).replace(',', '.') : '',
            isPromo: finalPromo,
            isLay: Number(item.l) === 1,
            showCommission: !!item.c,
            showBoost: !!(item.b || item.i),
            percentualBoost: String(item.b || item.i || '').replace(',', '.'),
            isRainbow: isRainbow,
            valorReembolso: isRainbow ? String(faceValueRefund || item.re || '').replace(',', '.') : '',
            taxaExtracao: isRainbow ? String(extractionRefund || item.er || '70') : '',
            oddFinal: '', lucro: '', retorno: ''
          };
        });
        setEntradas(novas); setImportUrl(''); toast.success("Importado com sucesso!");
      }
    } catch (e) { toast.error("Erro ao importar."); }
  };

  if (!isOpen) return null;
  const entradasRender = entradas.map(item => { const oddBase = clean(item.odd); let oddFinal = oddBase; let oddParaCalculo = oddBase; const comissao = clean(item.comissao) / 100; const boost = clean(item.percentualBoost) / 100; let investimento = clean(item.stake); if (item.isLay) { if (oddBase > 0) { oddParaCalculo = oddBase - comissao; investimento = clean(item.stake) * (oddBase - 1); } } else { if (boost > 0) oddFinal = oddBase + ((oddBase - 1) * boost); if (item.isPromo) { oddParaCalculo = (oddFinal - 1) * (1 - comissao); investimento = 0; } else { oddParaCalculo = 1 + ((oddFinal - 1) * (1 - comissao)); } } return { ...item, oddFinalDisplay: oddFinal > 0 ? oddFinal.toFixed(2) : '-', oddParaCalculo, investimento, cleanStake: clean(item.stake) }; });
  const totalInv = entradasRender.reduce((acc, cur) => acc + cur.investimento, 0);

  const lucrosPorCenario = entradasRender.map((itemVencedor, idxVencedor) => {
    const retornoVencedor = itemVencedor.cleanStake * itemVencedor.oddParaCalculo;
    const totalReembolso = entradasRender.reduce((acc, item, idx) => {
      if (idx === idxVencedor) return acc;
      const refundEfetivo = item.isRainbow ? clean(item.valorReembolso) * (clean(item.taxaExtracao) / 100) : 0;
      return acc + refundEfetivo;
    }, 0);
    return retornoVencedor - totalInv + totalReembolso;
  });

  const totalLucro = Math.min(...lucrosPorCenario);
  const promoLeg = entradasRender.find(e => e.isPromo);
  const baseCalculoROI = (promoLeg && clean(promoLeg.stake) > 0) ? clean(promoLeg.stake) : totalInv;
  const roi = baseCalculoROI > 0 ? (totalLucro / baseCalculoROI) * 100 : 0;

  const handleSalvarComCalculos = () => { 
    let estFinal = 'qualificacao'; 
    if (entradas.some(e => e.isRainbow)) estFinal = 'rainbow'; 
    else if (entradas.some(e => e.isPromo)) estFinal = 'freebet'; 
    const dadosParaSalvar = entradasRender.map(item => ({ ...item, nome: estFinal, lucro: (item.cleanStake * item.oddParaCalculo - totalInv).toFixed(2), retorno: (item.cleanStake * item.oddParaCalculo).toFixed(2), stake: item.cleanStake.toString(), investimento: item.investimento.toFixed(2) })); 
    onSave(dadosParaSalvar, { lucro: totalLucro, investido: totalInv, retorno: totalLucro + totalInv }); 
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-4 overflow-y-auto">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <div className="relative z-10 bg-slate-950 w-full max-w-[1200px] rounded-[3rem] shadow-2xl border border-zinc-900 flex flex-col max-h-[98vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-6 border-b border-zinc-900 bg-slate-900/50">
          <div className="flex items-center gap-4 min-w-max"><div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"><Calculator size={24} /></div><div><h2 className="text-xl font-black text-white uppercase italic tracking-tight leading-none">Calculadora</h2><p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1">{entradas.some(e => e.isRainbow) ? 'Rainbow' : entradas.some(e => e.isPromo) ? 'Free bet' : 'Qualificação'}</p></div></div>
          <div className="flex flex-1 flex-col md:flex-row items-center gap-3 w-full"><div className="relative flex-1 group w-full"><div className="absolute -inset-px bg-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div><div className="relative flex items-center bg-black border border-zinc-800 rounded-xl hover:border-cyan-500/40 transition-colors"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" /><input type="text" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="COLE O LINK DA CALCULADORA..." className="w-full bg-transparent border-none rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white focus:ring-0 placeholder-zinc-800" /></div></div><button onClick={handleImportUrl} disabled={!importUrl} className="h-11 px-6 bg-zinc-900 hover:bg-cyan-500 hover:text-black disabled:opacity-30 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl min-w-max">Importar</button><div className="relative group w-full md:w-44"><div className="absolute -inset-px bg-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div><div className="relative flex items-center gap-2 bg-black px-3 py-2 rounded-xl border border-zinc-800 hover:border-indigo-500/40 transition-colors cursor-pointer h-11"><Settings2 size={16} className="text-indigo-400" /><div className="flex flex-col flex-1"><span className="text-[7px] font-black text-zinc-700 uppercase leading-none">Arredondar</span><span className="text-[10px] font-bold text-white">R$ {arredondamento.toFixed(2)}</span></div><ChevronDown size={14} className="text-slate-500" /><select value={arredondamento} onChange={(e) => setArredondamento(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"><option className="bg-slate-900 text-white" value={0.01}>R$ 0,01</option><option className="bg-slate-900 text-white" value={0.10}>R$ 0,10</option><option className="bg-slate-900 text-white" value={0.50}>R$ 0,50</option><option className="bg-slate-900 text-white" value={1.00}>R$ 1,00</option></select></div></div><button type="button" onClick={onClose} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all border border-zinc-800 relative shadow-lg"><X size={24} /></button></div>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-black/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {entradas.map((entrada, index) => (
              <CardEntrada key={entrada.id} entrada={entrada} index={index} onUpdate={handleUpdate} onRemove={handleRemove} casasDisponiveis={casasApostas || []} />
            ))}
            <div className="flex flex-col gap-3 min-h-[200px]">
              <button onClick={handleAdd} className="flex-1 rounded-[2rem] border-2 border-dashed border-zinc-900 flex flex-col items-center justify-center gap-3 text-zinc-800 hover:text-cyan-400 hover:border-cyan-500 transition-all group shadow-xl">
                <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black tracking-widest uppercase">Adicionar Casa</span>
              </button>
            </div>
          </div>
          <div className="mt-8 bg-[#0E0E10] p-6 rounded-[2.5rem] border border-zinc-900 shadow-2xl">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black/40 shadow-inner">
              <table className="w-full text-left text-[9px] border-collapse">
                <thead className="bg-black/80 border-b border-zinc-900 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  <tr>
                    <th className="px-8 py-6">Cenário Vencedor</th>
                    <th className="px-4 py-6 text-center">Odd Final</th>
                    <th className="px-4 py-6 text-center">Com. %</th>
                    <th className="px-4 py-6 text-center">Stake Real</th>
                    <th className="px-4 py-6 text-center text-red-500/70">Déficit</th>
                    <th className="px-8 py-6 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 bg-black/20">
                  {entradasRender.map((item, index) => {
                    const retornoVencedor = item.cleanStake * item.oddParaCalculo;
                    const totalReembolsoOutras = entradasRender.reduce((acc, it, i) => {
                      if (i === index) return acc;
                      const refundEfetivo = it.isRainbow ? clean(it.valorReembolso) * (clean(it.taxaExtracao) / 100) : 0;
                      return acc + refundEfetivo;
                    }, 0);
                    const deficitValue = retornoVencedor - totalInv;
                    const lucroCen = deficitValue + totalReembolsoOutras;

                    return (<tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <span className="text-base font-black text-white uppercase italic">{item.casa || `Casa ${index + 1}`}</span>
                        {item.isPromo && <span className="ml-4 text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Free bet</span>}
                        {item.isRainbow && <span className="ml-4 text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border bg-purple-500/10 text-purple-400 border-purple-500/20">Reembolso</span>}
                      </td>
                      <td className="px-4 py-6 text-center font-mono text-base text-zinc-500">{item.oddFinalDisplay}</td>
                      <td className="px-4 py-6 text-center text-zinc-600 font-mono text-base">{clean(item.comissao) > 0 ? `${item.comissao}%` : '—'}</td>
                      <td className="px-4 py-6 text-center font-mono text-base text-zinc-300">R$ {item.cleanStake.toFixed(2)}{item.isLay ? ' (LAY)' : ''}</td>
                      <td className={`px-4 py-6 text-center font-mono font-bold text-base ${deficitValue >= 0 ? 'text-zinc-700' : 'text-red-500/40'}`}>{deficitValue >= 0 ? '—' : `-R$ ${Math.abs(deficitValue).toFixed(2)}`}</td>
                      <td className={`px-8 py-6 text-right font-black text-2xl ${lucroCen >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{lucroCen >= 0 ? '+' : ''}R$ {lucroCen.toFixed(2)}</td>
                    </tr>);
                  })}
                </tbody>
                <tfoot className="bg-black/80 border-t border-zinc-900">
                  <tr>
                    <td className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Totais</td>
                    <td className="px-4 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-zinc-600 font-black uppercase mb-1">ROI</span>
                        <span className={`text-xl font-black font-mono ${roi >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>{roi.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-zinc-600 font-black uppercase mb-1">Investido</span>
                        <span className="text-xl font-black text-zinc-300">R$ {totalInv.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right" colSpan={3}>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-zinc-600 font-black uppercase mb-1">Resultado Mínimo</span>
                        <div className={`text-3xl font-black ${totalLucro >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>R$ {totalLucro.toFixed(2)}</div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="shrink-0 p-8 mt-8 border-t border-zinc-900 flex gap-6">
            <button type="button" onClick={onClose} className="flex-1 h-16 bg-white/5 border border-white/5 rounded-[2rem] text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all shadow-lg">Cancelar</button>
            <button type="button" onClick={handleSalvarComCalculos} className="flex-[2] h-16 bg-emerald-600 hover:bg-emerald-500 rounded-[2rem] text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
              <Check size={20} /> Confirmar Operação 🔥
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};
export default AddFaseModal;
