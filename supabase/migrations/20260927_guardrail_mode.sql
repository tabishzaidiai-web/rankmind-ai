-- Guardrail Mode: pause autonomous side effects until the user approves them.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS guardrail_mode BOOLEAN NOT NULL DEFAULT TRUE;
