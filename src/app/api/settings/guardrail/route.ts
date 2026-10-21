import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isGuardrailEnabled, setGuardrailEnabled } from '@/lib/guardrails';

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ enabled: await isGuardrailEnabled(user.id) });
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (typeof body?.enabled !== 'boolean') {
    return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 });
  }

  const saved = await setGuardrailEnabled(user.id, body.enabled);
  if (!saved) return NextResponse.json({ error: 'Could not save Guardrail Mode' }, { status: 500 });
  return NextResponse.json({ enabled: body.enabled });
}
