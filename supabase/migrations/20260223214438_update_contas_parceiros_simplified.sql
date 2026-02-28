-- Simplificar a tabela contas_parceiros removendo campos de rollover e adicionando observações e datas
ALTER TABLE public.contas_parceiros 
DROP COLUMN IF EXISTS valor_inicial,
DROP COLUMN IF EXISTS rollover_alvo,
DROP COLUMN IF EXISTS historico_apostas,
DROP COLUMN IF EXISTS jogo_atual;

ALTER TABLE public.contas_parceiros 
ADD COLUMN IF NOT EXISTS observacoes text default '',
ADD COLUMN IF NOT EXISTS data_atualizacao timestamp with time zone default now();
