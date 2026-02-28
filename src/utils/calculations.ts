// src/utils/calculations.ts

import { Operacao, Procedimento } from "../db/db";
import { format, parseISO, subDays, isAfter } from 'date-fns';

export const CLOSED_OP_STATUSES: Operacao['status'][] = ['concluido', 'finalizada'];
export const OPEN_OP_STATUSES: Operacao['status'][] = ['em_andamento', 'pendente', 'aguardando_freebet'];


/**
 * A safe utility to ensure a value is a number, returning 0 if not.
 * @param val The value to sanitize.
 * @returns A number.
 */
export const safeNum = (val: string | number | undefined | null): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    let str = String(val).replace('R$', '').trim();
    if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
};

/**
 * Calculates the net profit of an operation after subtracting partnership commissions.
 * Also handles Duplo Green (isDG) logic.
 * @param op The operation object.
 * @returns The net profit.
 */
export const getNetProfit = (op: Operacao): number => {
    if (op.isDG) {
        const valDG = safeNum(op.lucroDG);
        if (op.repassarComissaoDG) {
            const comissaoPerc = safeNum(op.comissaoOperacao);
            return valDG * (1 - comissaoPerc / 100);
        }
        return valDG;
    }

    const totalLucro = safeNum(op.lucro ?? op.lucroPrejuizo);
    const comissaoPerc = safeNum(op.comissaoOperacao);
    
    // O repasse é calculado sobre o lucro total
    const repasse = totalLucro * (comissaoPerc / 100);
    
    return totalLucro - repasse;
};

/**
 * Calculates key financial metrics from a list of operations.
 * This is the centralized source of truth for financial calculations.
 */
export const calculateNetProfitAndExposure = (operacoes: Operacao[] | undefined) => {
    if (!operacoes) {
        return { lucroRealizado: 0, dinheiroEmJogo: 0, totalStake: 0, totalReturn: 0, closedOps: [] };
    }

    const closedOps = operacoes.filter(op => CLOSED_OP_STATUSES.includes(op.status));
    const openOps = operacoes.filter(op => OPEN_OP_STATUSES.includes(op.status));
    
    const lucroRealizado = closedOps.reduce((acc, op) => acc + getNetProfit(op), 0);

    // Apostado Real: Soma de TODAS as stakes do período (Abertas ou Fechadas)
    // O dinheiro já saiu da banca, então deve ser contabilizado como aposta realizada.
    const totalStake = operacoes.reduce((acc, op) => {
        const stakeFases = (op.fases || []).reduce((sum, fase) => sum + safeNum(fase.investido || fase.stake), 0);
        return acc + (stakeFases > 0 ? stakeFases : safeNum(op.investido || op.stake));
    }, 0);

    // Retorno Bruto: Soma do (Investido + Lucro) apenas das operações finalizadas.
    // É o dinheiro que efetivamente voltou para o caixa.
    const totalReturn = closedOps.reduce((acc, op) => {
        const investidoOp = (op.fases || []).reduce((sum, fase) => sum + safeNum(fase.investido || fase.stake), 0) || safeNum(op.investido || op.stake);
        const lucroOp = getNetProfit(op);
        return acc + (investidoOp + lucroOp);
    }, 0);
    
    const dinheiroEmJogo = openOps.reduce((acc, op) => {
        const jaInvestido = (op.fases || []).reduce((sum, fase) => sum + safeNum(fase.investido || fase.stake), 0);
        return acc + (jaInvestido > 0 ? jaInvestido : safeNum(op.stake || op.investido));
    }, 0);


    return { lucroRealizado, dinheiroEmJogo, totalStake, totalReturn, closedOps };
};

/**
 * Calculates detailed metrics including WinRate, Streak, and Performance by Strategy.
 */
export const calculateDetailedMetrics = (operacoes: Operacao[], bancaInicial: number = 0) => {
    const { lucroRealizado, dinheiroEmJogo, totalStake, totalReturn, closedOps } = calculateNetProfitAndExposure(operacoes);
    
    const bancaAtual = bancaInicial + lucroRealizado;
    const growth = bancaInicial > 0 ? (lucroRealizado / bancaInicial) * 100 : 0;
    const roi = totalStake > 0 ? (lucroRealizado / totalStake) * 100 : 0;

    const countGreen = closedOps.filter(op => getNetProfit(op) > 0).length;
    const countTotal = closedOps.length;
    const winRate = countTotal > 0 ? Math.round((countGreen / countTotal) * 100) : 0;

    // Strategy Performance
    const strategyStats: Record<string, { lucro: number; count: number }> = {};
    closedOps.forEach(op => {
      const est = op.estrategia || 'Outros';
      const lucro = getNetProfit(op);
      if (!strategyStats[est]) strategyStats[est] = { lucro: 0, count: 0 };
      strategyStats[est].lucro += lucro;
      strategyStats[est].count += 1;
    });

    const barChartData = Object.entries(strategyStats).map(([name, stats]) => ({
      name, Lucro: Number(stats.lucro.toFixed(2)), Quantidade: stats.count
    })).sort((a, b) => b.Lucro - a.Lucro);

    const bestStrategy = Object.entries(strategyStats).reduce((a, b) => 
      (a[1].lucro > b[1].lucro) ? a : b, 
      ['N/A', { lucro: 0, count: 0 }]
    );

    return {
        lucroRealizado,
        dinheiroEmJogo,
        bancaAtual,
        growth: Number(growth.toFixed(2)),
        roi: Number(roi.toFixed(1)),
        winRate,
        countGreen,
        countTotal,
        barChartData,
        melhorProcedimento: bestStrategy[0],
        lucroMelhorProcedimento: bestStrategy[1].lucro,
        totalStake,
        totalReturn
    };
};

/**
 * Calculates current winning streak.
 */
export const calculateCurrentStreak = (allOperacoes: Operacao[]) => {
    let streak = 0;
    const sortedAllClosed = [...allOperacoes]
      .filter(op => CLOSED_OP_STATUSES.includes(op.status))
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
    for (const op of sortedAllClosed) {
      if (getNetProfit(op) > 0) {
        streak++;
      } else if (getNetProfit(op) < 0) {
        break; // Streak ends on loss
      }
      // If profit is 0 (neutral), it doesn't necessarily break a win streak or count towards it? 
      // Most bettors count only greens. Let's stay with breaking on red.
    }
    return streak;
};

/**
 * Calculates the top performing days (ranking).
 */
export const calculateTopDays = (operacoes: Operacao[], days: number = 7) => {
    const cutoff = subDays(new Date(), days);
    const filteredOps = operacoes.filter(op => op.data && isAfter(parseISO(op.data), cutoff));
    
    const dailyStats: Record<string, number> = {};
    filteredOps.forEach(op => {
      const day = format(parseISO(op.data), 'dd/MM');
      dailyStats[day] = (dailyStats[day] || 0) + getNetProfit(op);
    });

    return Object.entries(dailyStats)
      .map(([day, profit]) => ({ day, profit }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 3);
};

/**
 * Calculates the cumulative profit evolution from a list of closed operations.
 */
export const calculateEvolutionData = (closedOps: Operacao[]) => {
    if (!closedOps || closedOps.length === 0) {
        return [];
    }

    const sortedOps = [...closedOps].sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime());
    
    let cumulativeProfit = 0;
    const dailyProfitMap = new Map<string, number>();

    sortedOps.forEach(op => {
        const dateKey = format(parseISO(op.data), 'yyyy-MM-dd');
        dailyProfitMap.set(dateKey, (dailyProfitMap.get(dateKey) || 0) + getNetProfit(op));
    });

    const evolutionData = Array.from(dailyProfitMap.entries())
        .sort(([dateA], [dateB]) => parseISO(dateA).getTime() - parseISO(dateB).getTime())
        .map(([date, dailyProfit]) => {
            cumulativeProfit += dailyProfit;
            return {
                name: format(parseISO(date), 'dd/MM'),
                Lucro: cumulativeProfit,
            };
        });

    return evolutionData;
};

/**
 * Safely formats a number with fixed decimal places, handling null/undefined/strings.
 */
export const safeFixed = (val: any, decimals: number = 2): string => {
    const num = safeNum(val);
    return num.toFixed(decimals);
};

/**
 * A utility to format a number as BRL currency.
 */
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeNum(value));
};

/**
 * A utility to format a date string, with a fallback for invalid dates.
 */
export const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'Data Inválida';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return 'Data Inválida';
    }
    return dateObj.toLocaleDateString('pt-BR');
};
