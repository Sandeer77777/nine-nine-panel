/**
 * ENGINE MATEMÁTICA DE APOSTAS (Core Logic)
 * Encapsula a lógica de Normal, Freebet (SNR) e Cashback.
 */

// --- 1. DEFINIÇÃO DE TIPOS ---

export interface BetInput {
  odd: number;
  stake?: number;      // Usado para a aposta "fixa" ou valor da freebet
  commission: number;  // %
  isLay: boolean;
  isFreebet: boolean;  // SNR
}

export interface CalculationResult {
  stakes: (number | undefined)[]; 
  profits: number[]; 
  totalInvestment: number; 
  guaranteedProfit: number; 
  roi: number; 
}

// --- 2. HELPERS MATEMÁTICOS ---

export const Utils = {
  parseFlex: (value: string | number): number => {
    if (value === '' || value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const cleaned = value.toString().replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  },
  formatCurrency: (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
  formatPercent: (value: number) => `${value.toFixed(2)}%`
};

export function calculateEffectiveOdd(odd: number, commission: number, isLay: boolean): number {
  if (odd <= 1) return 1;
  const comm = commission / 100;
  
  if (isLay) {
    // Lay: 1 + (1 - comm) / (odd - 1)
    return 1 + (1 - comm) / (odd - 1);
  } else {
    // Back: 1 + (odd - 1) * (1 - comm)
    return 1 + (odd - 1) * (1 - comm);
  }
}

export function calculateLiability(stake: number, odd: number): number {
  if (odd <= 1 || stake <= 0) return 0;
  return stake * (odd - 1);
}

// --- 3. ESTRATÉGIAS (EXPORTS) ---

/**
 * ESTRATÉGIA NORMAL / ARBITRAGEM
 * Nivela o lucro entre os cenários baseando-se em uma aposta fixa.
 */
export function calculateNormalStrategy(bets: BetInput[]): CalculationResult | null {
  const fixedBetIndex = bets.findIndex(b => b.stake !== undefined && b.stake > 0);
  if (fixedBetIndex === -1) return null;

  const fixedBet = bets[fixedBetIndex];
  const fixedStake = fixedBet.stake!;
  const fixedEffOdd = calculateEffectiveOdd(fixedBet.odd, fixedBet.commission, fixedBet.isLay);
  
  // Retorno Alvo (Net Return)
  let targetNetReturn = 0;
  if (fixedBet.isLay) {
    targetNetReturn = fixedStake * (1 - fixedBet.commission / 100);
  } else {
    targetNetReturn = fixedStake * fixedEffOdd;
  }
  
  // Distribuir Stakes
  const calculatedStakes = bets.map((bet, i) => {
    if (i === fixedBetIndex) return bet.stake;
    const effOdd = calculateEffectiveOdd(bet.odd, bet.commission, bet.isLay);
    if (effOdd <= 1) return 0;
    
    // Simplificação: Assume que as coberturas são Backs ou Lays calculados pelo retorno
    return targetNetReturn / effOdd; 
  });

  // Calcular Resultados
  let totalInvestment = 0;
  const profits = bets.map((winnerBet, i) => {
    const stake = calculatedStakes[i] || 0;
    
    // Calcula custo total (Investimento + Responsabilidade)
    totalInvestment = calculatedStakes.reduce((sum, s, j) => {
      const b = bets[j];
      if (b.isLay) return (sum || 0) + calculateLiability(s || 0, b.odd);
      return (sum || 0) + (s || 0);
    }, 0) || 0;

    const effOdd = calculateEffectiveOdd(winnerBet.odd, winnerBet.commission, winnerBet.isLay);
    let netReturn = 0;

    if (winnerBet.isLay) netReturn = stake * (1 - winnerBet.commission / 100);
    else netReturn = stake * effOdd;

    return netReturn - totalInvestment;
  });

  const guaranteedProfit = Math.min(...profits);
  const roi = totalInvestment > 0 ? (guaranteedProfit / totalInvestment) * 100 : 0;

  return { stakes: calculatedStakes, profits, totalInvestment, guaranteedProfit, roi };
}

/**
 * ESTRATÉGIA FREEBET (SNR)
 */
export function calculateFreebetStrategy(promoBet: BetInput, coverBets: BetInput[]): CalculationResult | null {
  const freebetValue = promoBet.stake || 0;
  if (freebetValue <= 0) return null;

  // Lucro alvo: Valor da Freebet * (Odd - 1)
  const promoEffOdd = calculateEffectiveOdd(promoBet.odd, promoBet.commission, false); 
  const targetProfit = freebetValue * (promoEffOdd - 1);

  // Calcular Stakes de Cobertura
  const coverStakes = coverBets.map(bet => {
    const effOdd = calculateEffectiveOdd(bet.odd, bet.commission, bet.isLay);
    if (effOdd <= 1) return 0;
    return targetProfit / (effOdd - 1);
  });

  // Calcular Investimento Real (Apenas coberturas e responsabilidades)
  const totalInvestment = coverStakes.reduce((sum, stake, i) => {
    const bet = coverBets[i];
    if (bet.isLay) return sum + calculateLiability(stake, bet.odd);
    return sum + stake;
  }, 0);

  // Calcular Lucros
  const profits = [promoBet, ...coverBets].map((bet, i) => {
    if (i === 0) return targetProfit - totalInvestment; // Promo vence
    
    // Cobertura vence
    // No Dutching de Freebet, o retorno da cobertura paga o investimento + lucro
    // Mas simplificando: Lucro Garantido deve ser igual
    return targetProfit - totalInvestment; 
  });

  const guaranteedProfit = profits[0]; // Em dutching perfeito são iguais
  const roi = totalInvestment > 0 ? (guaranteedProfit / totalInvestment) * 100 : 0;

  return { stakes: [freebetValue, ...coverStakes], profits, totalInvestment, guaranteedProfit, roi };
}

/**
 * ESTRATÉGIA CASHBACK / REEMBOLSO
 */
export function calculateCashbackStrategy(qualifyingBet: BetInput, coverBets: BetInput[], cashbackRate: number): CalculationResult | null {
  const P = qualifyingBet.stake || 0;
  if (P <= 0) return null;

  const C = P * (cashbackRate / 100);
  const o_q_eff = calculateEffectiveOdd(qualifyingBet.odd, qualifyingBet.commission, false);
  const effectiveCoverOdds = coverBets.map(b => calculateEffectiveOdd(b.odd, b.commission, b.isLay));
  
  const H = effectiveCoverOdds.reduce((sum, effOdd) => sum + (1 / (effOdd || 1)), 0);
  
  // Fórmula Dutching Cashback
  const N = -P * (1 - o_q_eff + H * o_q_eff) + H * C;
  const S_total = P * o_q_eff - N;
  const numerator = (N + S_total - C);

  const coverStakes = effectiveCoverOdds.map(effOdd => numerator / (effOdd || 1));
  
  // Investimento Real (Risco)
  const totalInvestment = P + coverStakes.reduce((sum, stake, i) => {
    const bet = coverBets[i];
    if (bet.isLay) return sum + calculateLiability(stake, bet.odd);
    return sum + stake;
  }, 0); // Note: Dependendo da visão, o investimento pode ser considerado sem o reembolso.
  
  // Lucro Estimado (Simplificado para nivelamento)
  const profit = (P * o_q_eff) - totalInvestment; 
  
  return {
    stakes: [P, ...coverStakes],
    profits: [profit, profit], // Assume nivelado
    totalInvestment,
    guaranteedProfit: profit,
    roi: totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0
  };
}