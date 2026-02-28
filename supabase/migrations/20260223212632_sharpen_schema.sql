-- SUPABASE MASTER SCHEMA - ORGANIZAÇÃO TÁTICA (FREEBET PRO)

-- 1. TABELA DE PARCERIAS (SÓCIOS)
CREATE TABLE IF NOT EXISTS public.parcerias (
    id bigint primary key generated always as identity,
    nome text not null,
    contato text,
    created_at timestamp with time zone default now()
);

-- 2. TABELA DE CASAS DE APOSTA
CREATE TABLE IF NOT EXISTS public.casas_apostas (
    id bigint primary key generated always as identity,
    nome text not null,
    status text default 'ativa',
    saldo numeric default 0,
    created_at timestamp with time zone default now()
);

-- 3. TABELA DE OPERAÇÕES (NÚCLEO DO SISTEMA)
CREATE TABLE IF NOT EXISTS public.operacoes (
    id bigint primary key generated always as identity,
    nome text,
    data timestamp with time zone not null,
    data_criacao timestamp with time zone default now(),
    data_finalizacao timestamp with time zone,
    status text default 'em_andamento',
    estrategia text default 'Qualificação',
    stake numeric default 0,
    investido numeric default 0,
    retorno numeric default 0,
    lucro_prejuizo numeric default 0,
    parceiro_ids jsonb default '[]'::jsonb,
    comissao_operacao numeric default 0,
    
    -- Campos DG (Duplo Green)
    is_dg boolean default false,
    lucro_dg numeric default 0,
    repassar_comissao_dg boolean default true,
    
    -- Fases e Detalhes
    fases jsonb default '[]'::jsonb,
    created_at timestamp with time zone default now()
);

-- 4. TABELA DE TRANSAÇÕES (FINANCEIRO)
CREATE TABLE IF NOT EXISTS public.transacoes (
    id bigint primary key generated always as identity,
    data timestamp with time zone default now(),
    descricao text,
    valor numeric not null,
    tipo text not null, -- receita, despesa, pagamento
    categoria text,
    origem_operacao_id bigint references public.operacoes(id) on delete cascade,
    status text default 'consolidado',
    responsavel text,
    metodo text,
    created_at timestamp with time zone default now()
);

-- 5. TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS public.configuracoes (
    chave text primary key,
    valor jsonb,
    created_at timestamp with time zone default now()
);

-- 6. TABELA DE CONTAS DE PARCEIROS (CENTRAL DG / ROLLOVER)
CREATE TABLE IF NOT EXISTS public.contas_parceiros (
    id bigint primary key generated always as identity,
    parceiro_id bigint references public.parcerias(id) on delete cascade,
    casa_id bigint references public.casas_apostas(id) on delete cascade,
    valor_inicial numeric default 0,
    saldo_real numeric default 0,
    rollover_alvo numeric default 0,
    historico_apostas jsonb default '[]'::jsonb,
    status text default 'ativar',
    created_at timestamp with time zone default now()
);

-- 7. ADICIONAR COLUNAS CASO JÁ EXISTAM AS TABELAS (GARANTIA DE ATUALIZAÇÃO)
DO $$ 
BEGIN
    -- Operações
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='operacoes' AND column_name='is_dg') THEN
        ALTER TABLE public.operacoes ADD COLUMN is_dg boolean default false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='operacoes' AND column_name='lucro_dg') THEN
        ALTER TABLE public.operacoes ADD COLUMN lucro_dg numeric default 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='operacoes' AND column_name='repassar_comissao_dg') THEN
        ALTER TABLE public.operacoes ADD COLUMN repassar_comissao_dg boolean default true;
    END IF;
END $$;

-- 8. INDEXAÇÃO PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_operacoes_data ON public.operacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON public.transacoes(data);
CREATE INDEX IF NOT EXISTS idx_contas_casa ON public.contas_parceiros(casa_id);

-- 9. CONFIGURAÇÃO DE REALTIME (Sincronização Instantânea)
-- Removemos e recriamos a publicação para garantir que todas as tabelas estejam nela
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 10. REPLICA IDENTITY (Necessário para o Realtime detectar mudanças em todas as colunas)
ALTER TABLE public.parcerias REPLICA IDENTITY FULL;
ALTER TABLE public.casas_apostas REPLICA IDENTITY FULL;
ALTER TABLE public.operacoes REPLICA IDENTITY FULL;
ALTER TABLE public.transacoes REPLICA IDENTITY FULL;
ALTER TABLE public.configuracoes REPLICA IDENTITY FULL;
ALTER TABLE public.contas_parceiros REPLICA IDENTITY FULL;
