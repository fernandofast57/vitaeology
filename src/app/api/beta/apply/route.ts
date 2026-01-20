// POST /api/beta/apply - Candidatura pubblica beta tester

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      email,
      full_name,
      job_title,
      company,
      years_experience,
      device,
      motivation,
      hours_available,
      source,
    } = body;

    // Validazione
    if (!email || !full_name || !job_title || !years_experience || !device || !motivation || !hours_available) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori' },
        { status: 400 }
      );
    }

    // Verifica email valida
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Verifica se email già registrata
    const { data: existing } = await supabase
      .from('beta_testers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Questa email è già registrata. Ti contatteremo presto!' },
        { status: 409 }
      );
    }

    // Inserisci candidatura
    const { data, error } = await supabase
      .from('beta_testers')
      .insert({
        email: email.toLowerCase(),
        full_name,
        job_title,
        company: company || null,
        years_experience,
        device,
        motivation,
        hours_available,
        source: source || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Errore inserimento beta tester:', error);
      return NextResponse.json(
        { error: 'Errore durante la registrazione. Riprova più tardi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Candidatura ricevuta! Ti contatteremo entro 48 ore.',
      id: data.id,
    });
  } catch (error) {
    console.error('Errore API beta/apply:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
