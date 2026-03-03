-- BLINDAGEM NUCLEAR DE DADOS - WEB PROCEDIMENTOS
-- Este script garante que nenhum usuário veja dados de outro.

DO $$ 
DECLARE 
    t text;
    tables_to_fix text[] := ARRAY['operacoes', 'parcerias', 'casas_apostas', 'transacoes', 'contas_parceiros', 'configuracoes'];
BEGIN
    FOREACH t IN ARRAY tables_to_fix LOOP
        -- 1. Habilitar RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- 2. Remover TODAS as políticas existentes para começar do zero
        EXECUTE (
            SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.%I', policyname, t), '; ')
            FROM pg_policies 
            WHERE tablename = t AND schemaname = 'public'
        );

        -- 3. Criar Política de SELECT (Ver apenas o que é seu)
        EXECUTE format('CREATE POLICY "Users can only view their own data" ON public.%I FOR SELECT USING (auth.uid() = user_id)', t);
        
        -- 4. Criar Política de INSERT (Inserir apenas com seu ID)
        EXECUTE format('CREATE POLICY "Users can only insert their own data" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t);
        
        -- 5. Criar Política de UPDATE (Editar apenas o que é seu)
        EXECUTE format('CREATE POLICY "Users can only update their own data" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', t);
        
        -- 6. Criar Política de DELETE (Deletar apenas o que é seu)
        EXECUTE format('CREATE POLICY "Users can only delete their own data" ON public.%I FOR DELETE USING (auth.uid() = user_id)', t);
        
        RAISE NOTICE 'Segurança aplicada na tabela: %', t;
    END LOOP;
END $$;
