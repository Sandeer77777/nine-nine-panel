UPDATE public.parcerias 
SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' 
WHERE user_id IS NULL;

ALTER TABLE public.contas_parceiros ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

UPDATE public.contas_parceiros 
SET user_id = 'f7151827-a41b-41c0-831a-4e23626bf22d' 
WHERE user_id IS NULL;

ALTER TABLE public.contas_parceiros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Isolamento SELECT" ON public.contas_parceiros;
DROP POLICY IF EXISTS "Isolamento INSERT" ON public.contas_parceiros;
DROP POLICY IF EXISTS "Isolamento UPDATE" ON public.contas_parceiros;
DROP POLICY IF EXISTS "Isolamento DELETE" ON public.contas_parceiros;

CREATE POLICY "Isolamento SELECT" ON public.contas_parceiros FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Isolamento INSERT" ON public.contas_parceiros FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Isolamento UPDATE" ON public.contas_parceiros FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Isolamento DELETE" ON public.contas_parceiros FOR DELETE USING (auth.uid() = user_id);
