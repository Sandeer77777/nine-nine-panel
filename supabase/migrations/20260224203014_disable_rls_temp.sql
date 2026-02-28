-- STEP 1: DESATIVAR RLS (ABRIR TUDO)
ALTER TABLE public.transacoes DISABLE ROW LEVEL SECURITY;

-- STEP 2: LIMPAR POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "transacoes_full_access" ON public.transacoes;
DROP POLICY IF EXISTS "privacidade_transacoes_v2" ON public.transacoes;

-- STEP 3: REATIVAR RLS COM PERMISSÃO TOTAL PARA USUÁRIOS LOGADOS
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_delete_all" ON public.transacoes
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Garantir que a tabela de operações também não te bloqueie
ALTER TABLE public.operacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.operacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "master_delete_ops" ON public.operacoes
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);
