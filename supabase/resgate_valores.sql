UPDATE public.operacoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;
UPDATE public.transacoes SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' WHERE user_id IS NULL;

ALTER TABLE public.operacoes ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.transacoes ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

ALTER TABLE public.operacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Isolamento SELECT" ON public.operacoes;
DROP POLICY IF EXISTS "Isolamento INSERT" ON public.operacoes;
DROP POLICY IF EXISTS "Isolamento UPDATE" ON public.operacoes;
DROP POLICY IF EXISTS "Isolamento DELETE" ON public.operacoes;
CREATE POLICY "Isolamento SELECT" ON public.operacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Isolamento INSERT" ON public.operacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Isolamento UPDATE" ON public.operacoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Isolamento DELETE" ON public.operacoes FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Isolamento SELECT" ON public.transacoes;
DROP POLICY IF EXISTS "Isolamento INSERT" ON public.transacoes;
DROP POLICY IF EXISTS "Isolamento UPDATE" ON public.transacoes;
DROP POLICY IF EXISTS "Isolamento DELETE" ON public.transacoes;
CREATE POLICY "Isolamento SELECT" ON public.transacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Isolamento INSERT" ON public.transacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Isolamento UPDATE" ON public.transacoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Isolamento DELETE" ON public.transacoes FOR DELETE USING (auth.uid() = user_id);
