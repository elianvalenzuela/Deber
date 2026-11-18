CREATE TABLE public.registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir consultar registros"
ON public.registros
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Permitir crear registros"
ON public.registros
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Permitir editar registros"
ON public.registros
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminar registros"
ON public.registros
FOR DELETE TO anon, authenticated
USING (true);