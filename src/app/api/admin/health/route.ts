import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Health check per tutti i servizi critici (C11 fix: richiede admin auth)
export async function GET() {
  // Verifica admin auth
  try {
    const authSupabase = await createServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();

    if (!profile?.role_id) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Errore autenticazione' }, { status: 500 });
  }
  const results: {
    service: string;
    status: 'ok' | 'error' | 'warning';
    message: string;
    latency?: number;
  }[] = [];

  // 1. DATABASE (Supabase)
  try {
    const start = Date.now();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      results.push({
        service: 'Database (Supabase)',
        status: 'error',
        message: `Errore query: ${error.message}`,
        latency
      });
    } else {
      results.push({
        service: 'Database (Supabase)',
        status: 'ok',
        message: 'Connesso e funzionante',
        latency
      });
    }
  } catch (err) {
    results.push({
      service: 'Database (Supabase)',
      status: 'error',
      message: `Connessione fallita: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`
    });
  }

  // 2. AUTH (Supabase Auth)
  try {
    const start = Date.now();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verifica che il servizio auth risponda listando un utente
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });

    const latency = Date.now() - start;

    if (error) {
      results.push({
        service: 'Auth (Supabase)',
        status: 'error',
        message: `Errore auth: ${error.message}`,
        latency
      });
    } else {
      results.push({
        service: 'Auth (Supabase)',
        status: 'ok',
        message: `Funzionante (${data.users?.length || 0} utenti trovati)`,
        latency
      });
    }
  } catch (err) {
    results.push({
      service: 'Auth (Supabase)',
      status: 'error',
      message: `Auth fallito: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`
    });
  }

  // 3. EMAIL (Resend)
  try {
    const start = Date.now();

    if (!process.env.RESEND_API_KEY) {
      results.push({
        service: 'Email (Resend)',
        status: 'error',
        message: 'RESEND_API_KEY non configurata'
      });
    } else {
      // Verifica che l'API key sia valida facendo una richiesta ai domains
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        }
      });

      const latency = Date.now() - start;

      if (response.ok) {
        results.push({
          service: 'Email (Resend)',
          status: 'ok',
          message: 'API Key valida e funzionante',
          latency
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        results.push({
          service: 'Email (Resend)',
          status: 'error',
          message: `API Error: ${response.status} - ${errorData.message || 'Unknown'}`,
          latency
        });
      }
    }
  } catch (err) {
    results.push({
      service: 'Email (Resend)',
      status: 'error',
      message: `Connessione fallita: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`
    });
  }

  // 4. AI COACH (Anthropic)
  try {
    const start = Date.now();

    if (!process.env.ANTHROPIC_API_KEY) {
      results.push({
        service: 'AI Coach (Anthropic)',
        status: 'error',
        message: 'ANTHROPIC_API_KEY non configurata'
      });
    } else {
      // Verifica minima: controlla che l'API risponda
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }]
        })
      });

      const latency = Date.now() - start;

      if (response.ok) {
        results.push({
          service: 'AI Coach (Anthropic)',
          status: 'ok',
          message: 'API funzionante',
          latency
        });
      } else if (response.status === 401) {
        results.push({
          service: 'AI Coach (Anthropic)',
          status: 'error',
          message: 'API Key non valida',
          latency
        });
      } else if (response.status === 429) {
        results.push({
          service: 'AI Coach (Anthropic)',
          status: 'warning',
          message: 'Rate limit raggiunto, ma API funzionante',
          latency
        });
      } else {
        results.push({
          service: 'AI Coach (Anthropic)',
          status: 'error',
          message: `Errore API: ${response.status}`,
          latency
        });
      }
    }
  } catch (err) {
    results.push({
      service: 'AI Coach (Anthropic)',
      status: 'error',
      message: `Connessione fallita: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`
    });
  }

  // 5. PAYMENTS (Stripe)
  try {
    const start = Date.now();

    if (!process.env.STRIPE_SECRET_KEY) {
      results.push({
        service: 'Payments (Stripe)',
        status: 'error',
        message: 'STRIPE_SECRET_KEY non configurata'
      });
    } else {
      // Verifica che l'API key sia valida
      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
        }
      });

      const latency = Date.now() - start;

      if (response.ok) {
        results.push({
          service: 'Payments (Stripe)',
          status: 'ok',
          message: 'API funzionante',
          latency
        });
      } else if (response.status === 401) {
        results.push({
          service: 'Payments (Stripe)',
          status: 'error',
          message: 'API Key non valida',
          latency
        });
      } else {
        results.push({
          service: 'Payments (Stripe)',
          status: 'error',
          message: `Errore API: ${response.status}`,
          latency
        });
      }
    }
  } catch (err) {
    results.push({
      service: 'Payments (Stripe)',
      status: 'error',
      message: `Connessione fallita: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`
    });
  }

  // 6. EMBEDDINGS (OpenAI)
  try {
    const start = Date.now();

    if (!process.env.OPENAI_API_KEY) {
      results.push({
        service: 'Embeddings (OpenAI)',
        status: 'warning',
        message: 'OPENAI_API_KEY non configurata (RAG disabilitato)'
      });
    } else {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      const latency = Date.now() - start;

      if (response.ok) {
        results.push({
          service: 'Embeddings (OpenAI)',
          status: 'ok',
          message: 'API funzionante',
          latency
        });
      } else {
        results.push({
          service: 'Embeddings (OpenAI)',
          status: 'error',
          message: `Errore API: ${response.status}`,
          latency
        });
      }
    }
  } catch (err) {
    results.push({
      service: 'Embeddings (OpenAI)',
      status: 'error',
      message: `Connessione fallita: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`
    });
  }

  // Calcola stato generale
  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');
  const overallStatus = hasErrors ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: results
  });
}
