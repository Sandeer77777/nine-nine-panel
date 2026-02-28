-- HARDENING: RESTRINGIR ACESSO AO DONO REAL
-- Agora que os dados órfãos foram vinculados, não precisamos mais de regras abertas.

-- 1. Transações
DROP POLICY IF EXISTS "transacoes_full_access" ON public.transacoes;
DROP POLICY IF EXISTS "master_delete_all" ON public.transacoes;
DROP POLICY IF EXISTS "transacoes_policy_v2" ON public.transacoes;
DROP POLICY IF EXISTS "privacidade_transacoes_v2" ON public.transacoes;

CREATE POLICY "transacoes_owner_only" ON public.transacoes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- 2. Operações
DROP POLICY IF EXISTS "master_delete_ops" ON public.operacoes;
DROP POLICY IF EXISTS "privacidade_operacoes_v2" ON public.operacoes;

CREATE POLICY "operacoes_owner_only" ON public.operacoes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- 3. Parcerias
DROP POLICY IF EXISTS "privacidade_parcerias_v2" ON public.parcerias;

CREATE POLICY "parcerias_owner_only" ON public.parcerias
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);
