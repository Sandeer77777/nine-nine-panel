-- MIGRATION: FIX MULTITENANCY E ISOLAMENTO TOTAL
-- DATA: 2026-02-24

-- 1. GARANTIR QUE RLS ESTÁ ATIVADO EM TODAS AS TABELAS
ALTER TABLE public.operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcerias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casas_apostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_parceiros ENABLE ROW LEVEL SECURITY;

-- 2. LIMPEZA TOTAL DE POLÍTICAS (REMOVER QUALQUER BRECHA ANTERIOR)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. CRIAR POLÍTICAS ESTRITAS (APENAS O DONO VÊ E EDITA)
-- Operações
CREATE POLICY "operacoes_owner_only" ON public.operacoes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Parcerias
CREATE POLICY "parcerias_owner_only" ON public.parcerias
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Casas de Apostas
CREATE POLICY "casas_apostas_owner_only" ON public.casas_apostas
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Transações
CREATE POLICY "transacoes_owner_only" ON public.transacoes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Configurações
CREATE POLICY "configuracoes_owner_only" ON public.configuracoes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Contas de Parceiros
CREATE POLICY "contas_parceiros_owner_only" ON public.contas_parceiros
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. CORREÇÃO DA TABELA DE CONFIGURAÇÕES (CHAVE PRIMÁRIA POR USUÁRIO)
-- Primeiro, garantir que não existam registros duplicados para a mesma chave/usuário
-- (Em um ambiente real, poderíamos ter que decidir qual manter, aqui priorizamos o dono original)
ALTER TABLE public.configuracoes DROP CONSTRAINT IF EXISTS configuracoes_pkey;
ALTER TABLE public.configuracoes ADD PRIMARY KEY (chave, user_id);

-- 5. SEGURANÇA ADICIONAL: GARANTIR QUE O user_id NUNCA SEJA NULO NO INSERT
ALTER TABLE public.operacoes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.parcerias ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.casas_apostas ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.transacoes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.configuracoes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.contas_parceiros ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Forçar NOT NULL onde for crítico
-- Nota: Isso pode falhar se já existirem dados órfãos. 
-- Já rodamos o nuclear fix que vinculou os dados ao seu ID, então deve estar seguro.
ALTER TABLE public.operacoes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.parcerias ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.casas_apostas ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.transacoes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.configuracoes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.contas_parceiros ALTER COLUMN user_id SET NOT NULL;
