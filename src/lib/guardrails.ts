import { createClient } from '@supabase/supabase-js';

let serviceClient: ReturnType<typeof createClient> | null = null;

function getServiceClient() {
  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return serviceClient;
}

/** Guardrail Mode is enabled by default, including when the setting cannot be read. */
export async function isGuardrailEnabled(userId: string): Promise<boolean> {
  const { data, error } = await getServiceClient()
    .from('users')
    .select('guardrail_mode')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return true;
  const settings = data as unknown as { guardrail_mode?: boolean };
  return settings.guardrail_mode !== false;
}

export async function setGuardrailEnabled(userId: string, enabled: boolean): Promise<boolean> {
  const { error } = await getServiceClient()
    .from('users')
    .update({ guardrail_mode: enabled } as never)
    .eq('id', userId);

  return !error;
}
