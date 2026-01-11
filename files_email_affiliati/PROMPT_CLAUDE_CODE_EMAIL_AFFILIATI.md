# PROMPT CLAUDE CODE - EMAIL AFFILIATI

## Contesto

Implementazione sistema email per affiliati Vitaeology.
- 16 template email totali
- Sequenza sviluppo automatica (7 email)
- Notifiche su eventi (7 email)
- Reminder inattività (1 email)
- Sistema: Resend + React Email

---

## TASK 1: Database

File: `supabase/migrations/20260108009_affiliate_email_system.sql`

```sql
-- Tabella log email inviate
CREATE TABLE IF NOT EXISTS affiliate_email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  email_type VARCHAR(10) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB,
  
  CONSTRAINT valid_email_type CHECK (
    email_type IN ('T1', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 
                   'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'E1')
  )
);

CREATE INDEX idx_affiliate_email_log_affiliate ON affiliate_email_log(affiliate_id);
CREATE INDEX idx_affiliate_email_log_type ON affiliate_email_log(email_type);

-- Tabella stato sequenza
CREATE TABLE IF NOT EXISTS affiliate_email_sequence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  sequence_completed BOOLEAN DEFAULT FALSE,
  sequence_skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(affiliate_id)
);

-- Funzione: check se può inviare prossima email sequenza
CREATE OR REPLACE FUNCTION can_send_next_sequence_email(p_affiliate_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
BEGIN
  SELECT * INTO v_record
  FROM affiliate_email_sequence
  WHERE affiliate_id = p_affiliate_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF v_record.sequence_completed OR v_record.sequence_skipped THEN
    RETURN FALSE;
  END IF;
  
  IF v_record.current_step >= 7 THEN
    RETURN FALSE;
  END IF;
  
  -- Almeno 2 giorni dall'ultima email
  IF v_record.last_email_sent_at IS NOT NULL 
     AND v_record.last_email_sent_at > NOW() - INTERVAL '2 days' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Funzione: avanza sequenza
CREATE OR REPLACE FUNCTION advance_sequence_step(p_affiliate_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_new_step INTEGER;
BEGIN
  UPDATE affiliate_email_sequence
  SET 
    current_step = current_step + 1,
    last_email_sent_at = NOW(),
    sequence_completed = (current_step + 1 >= 7)
  WHERE affiliate_id = p_affiliate_id
  RETURNING current_step INTO v_new_step;
  
  RETURN v_new_step;
END;
$$ LANGUAGE plpgsql;

-- Vista affiliati per email
CREATE OR REPLACE VIEW v_affiliates_email_data AS
SELECT 
  a.id AS affiliate_id,
  a.email,
  a.nome,
  a.ref_code,
  a.abbonamento_utente,
  a.commissione_base,
  a.bonus_performance,
  (a.commissione_base + a.bonus_performance) AS commissione_totale,
  a.clienti_attivi,
  a.saldo_disponibile,
  a.created_at AS affiliate_created_at,
  
  -- Dati esperienza utente
  p.created_at AS user_created_at,
  EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER AS giorni_iscrizione,
  
  -- Stato sequenza
  COALESCE(es.current_step, 0) AS sequence_step,
  es.sequence_completed,
  es.last_email_sent_at,
  
  -- Ultimo click
  (SELECT MAX(created_at) FROM affiliate_clicks WHERE affiliate_id = a.id) AS last_click_at

FROM affiliates a
JOIN profiles p ON a.user_id = p.id
LEFT JOIN affiliate_email_sequence es ON es.affiliate_id = a.id
WHERE a.stato = 'active';
```

---

## TASK 2: Template Email Base

File: `src/emails/affiliate/base-template.tsx`

```tsx
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface AffiliateEmailProps {
  previewText: string;
  children: React.ReactNode;
}

export const AffiliateEmailTemplate = ({
  previewText,
  children,
}: AffiliateEmailProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        {children}
        <Hr style={hr} />
        <Text style={footer}>
          Vitaeology - Leadership Development Platform
          <br />
          <Link href="https://vitaeology.com/affiliate/dashboard" style={link}>
            La tua dashboard
          </Link>
          {' | '}
          <Link href="https://vitaeology.com/affiliate/unsubscribe" style={link}>
            Gestisci preferenze email
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '30px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};

const link = {
  color: '#0A2540',
  textDecoration: 'underline',
};

export default AffiliateEmailTemplate;
```

---

## TASK 3: Template T1 (Benvenuto)

File: `src/emails/affiliate/t1-benvenuto.tsx`

```tsx
import { Hr, Link, Text } from '@react-email/components';
import * as React from 'react';
import { AffiliateEmailTemplate } from './base-template';

interface T1Props {
  nome: string;
  refCode: string;
  abbonamentoUtente: string;
  commissioneBase: number;
}

export const T1Benvenuto = ({
  nome,
  refCode,
  abbonamentoUtente,
  commissioneBase,
}: T1Props) => (
  <AffiliateEmailTemplate previewText="La tua esperienza Vitaeology ora può aiutare altri">
    <Text style={heading}>
      Ciao {nome},
    </Text>
    
    <Text style={paragraph}>
      Hai attivato il programma affiliati.
    </Text>
    
    <Text style={paragraph}>
      Non ti chiediamo di diventare un venditore.
      Ti chiediamo di condividere ciò che stai già vivendo.
    </Text>
    
    <Hr style={hr} />
    
    <Text style={subheading}>IL TUO PROFILO</Text>
    
    <Text style={paragraph}>
      <strong>Codice:</strong> {refCode}<br />
      <strong>Abbonamento:</strong> {abbonamentoUtente}<br />
      <strong>Commissione:</strong> {commissioneBase}% su ogni vendita
    </Text>
    
    <Text style={paragraph}>
      <strong>Il tuo link:</strong><br />
      <Link href={`https://vitaeology.com/challenge/leadership?ref=${refCode}`} style={link}>
        https://vitaeology.com/challenge/leadership?ref={refCode}
      </Link>
    </Text>
    
    <Hr style={hr} />
    
    <Text style={subheading}>COSA SUCCEDE ORA</Text>
    
    <Text style={paragraph}>
      Nei prossimi giorni riceverai alcune email che ti aiuteranno a capire 
      come la tua esperienza con Vitaeology può essere utile ad altri.
    </Text>
    
    <Text style={paragraph}>
      Non c'è fretta. Non ci sono quote.<br />
      Solo la possibilità di condividere qualcosa che funziona.
    </Text>
    
    <Text style={paragraph}>
      → <Link href="https://vitaeology.com/affiliate/dashboard" style={link}>
        La tua dashboard
      </Link>
    </Text>
    
    <Text style={signature}>
      A presto,<br />
      Fernando
    </Text>
  </AffiliateEmailTemplate>
);

const heading = {
  color: '#0A2540',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  marginBottom: '20px',
};

const subheading = {
  color: '#0A2540',
  fontSize: '14px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  marginBottom: '10px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
};

const link = {
  color: '#0A2540',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const signature = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  marginTop: '30px',
};

export default T1Benvenuto;
```

---

## TASK 4: Template D1-D7 (Sequenza Sviluppo)

Crea file simili per ogni email della sequenza:
- `src/emails/affiliate/d1-esperienza.tsx`
- `src/emails/affiliate/d2-risultati.tsx`
- `src/emails/affiliate/d3-condividere.tsx`
- `src/emails/affiliate/d4-a-chi.tsx`
- `src/emails/affiliate/d5-primo-link.tsx`
- `src/emails/affiliate/d6-domande.tsx`
- `src/emails/affiliate/d7-pronto.tsx`

Il contenuto di ogni email è nel documento STRATEGIA_EMAIL_AFFILIATI_VITAEOLOGY_v2.md

---

## TASK 5: API Invio Email

File: `src/app/api/affiliate/emails/send/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { T1Benvenuto } from '@/emails/affiliate/t1-benvenuto';
// Import altri template...

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { affiliateId, emailType, metadata } = await request.json();
    
    // Verifica autorizzazione (admin o sistema)
    // ...
    
    // Ottieni dati affiliato
    const { data: affiliate } = await supabase
      .from('v_affiliates_email_data')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .single();
    
    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliato non trovato' }, { status: 404 });
    }
    
    // Seleziona template
    let emailComponent;
    let subject;
    
    switch (emailType) {
      case 'T1':
        subject = 'La tua esperienza Vitaeology ora può aiutare altri';
        emailComponent = T1Benvenuto({
          nome: affiliate.nome,
          refCode: affiliate.ref_code,
          abbonamentoUtente: affiliate.abbonamento_utente,
          commissioneBase: affiliate.commissione_base,
        });
        break;
      // Altri case per D1-D7, N1-N7, E1...
      default:
        return NextResponse.json({ error: 'Tipo email non valido' }, { status: 400 });
    }
    
    // Invia email
    const { data, error } = await resend.emails.send({
      from: 'Fernando <fernando@vitaeology.com>',
      to: affiliate.email,
      subject,
      react: emailComponent,
    });
    
    if (error) {
      console.error('Errore invio email:', error);
      return NextResponse.json({ error: 'Errore invio email' }, { status: 500 });
    }
    
    // Log email inviata
    await supabase.from('affiliate_email_log').insert({
      affiliate_id: affiliateId,
      email_type: emailType,
      metadata: { resend_id: data?.id, ...metadata },
    });
    
    // Se sequenza, avanza step
    if (emailType.startsWith('D')) {
      await supabase.rpc('advance_sequence_step', { p_affiliate_id: affiliateId });
    }
    
    return NextResponse.json({ success: true, emailId: data?.id });
    
  } catch (error) {
    console.error('Errore:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
```

---

## TASK 6: Job Processamento Sequenze

File: `src/app/api/cron/affiliate-emails/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verifica header cron (Vercel Cron o simile)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createClient();
  const results = { t1: 0, sequence: 0, e1: 0 };
  
  try {
    // 1. Nuovi affiliati senza T1
    const { data: newAffiliates } = await supabase
      .from('affiliates')
      .select('id, email, nome')
      .eq('stato', 'active')
      .not('id', 'in', 
        supabase.from('affiliate_email_log')
          .select('affiliate_id')
          .eq('email_type', 'T1')
      );
    
    for (const affiliate of newAffiliates || []) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId: affiliate.id, emailType: 'T1' }),
      });
      
      // Crea record sequenza
      await supabase.from('affiliate_email_sequence').insert({
        affiliate_id: affiliate.id,
        current_step: 0,
        last_email_sent_at: new Date().toISOString(),
      });
      
      results.t1++;
    }
    
    // 2. Affiliati in sequenza
    const { data: inSequence } = await supabase
      .from('affiliate_email_sequence')
      .select('affiliate_id, current_step')
      .eq('sequence_completed', false)
      .eq('sequence_skipped', false)
      .lt('current_step', 7)
      .lt('last_email_sent_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString());
    
    for (const record of inSequence || []) {
      const nextStep = record.current_step + 1;
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          affiliateId: record.affiliate_id, 
          emailType: `D${nextStep}` 
        }),
      });
      results.sequence++;
    }
    
    // 3. Check inattività (14 giorni senza click)
    const { data: inactive } = await supabase
      .from('v_affiliates_email_data')
      .select('affiliate_id')
      .lt('last_click_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .eq('sequence_completed', true);
    
    for (const affiliate of inactive || []) {
      // Verifica non abbia ricevuto E1 negli ultimi 30 giorni
      const { data: recentE1 } = await supabase
        .from('affiliate_email_log')
        .select('id')
        .eq('affiliate_id', affiliate.affiliate_id)
        .eq('email_type', 'E1')
        .gt('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);
      
      if (!recentE1?.length) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/emails/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            affiliateId: affiliate.affiliate_id, 
            emailType: 'E1' 
          }),
        });
        results.e1++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      processed: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Errore cron email:', error);
    return NextResponse.json({ error: 'Errore processamento' }, { status: 500 });
  }
}
```

---

## TASK 7: Trigger Notifiche su Eventi

File: `src/lib/affiliate-notifications.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export async function sendAffiliateNotification(
  affiliateId: string,
  type: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7',
  metadata?: Record<string, any>
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/emails/send`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId, emailType: type, metadata }),
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error(`Errore notifica ${type}:`, error);
    return false;
  }
}

// Da chiamare nei rispettivi handler:

// In api/affiliate/track quando primo click
// await sendAffiliateNotification(affiliateId, 'N1');

// In webhook Stripe quando prima vendita
// await sendAffiliateNotification(affiliateId, 'N2', { bonus: 25 });

// In webhook Stripe per ogni commissione
// await sendAffiliateNotification(affiliateId, 'N3', { importo, percentuale });

// In aggiorna_metriche_affiliato quando bonus sbloccato
// await sendAffiliateNotification(affiliateId, 'N4', { bonus: '+3%' });

// In check_and_assign_milestone_bonus quando milestone
// await sendAffiliateNotification(affiliateId, 'N5', { milestone, bonus });

// Quando saldo >= 50 (dopo commissione)
// await sendAffiliateNotification(affiliateId, 'N6', { saldo });

// In api/admin/affiliates/payouts quando completato
// await sendAffiliateNotification(affiliateId, 'N7', { importo });
```

---

## TASK 8: Vercel Cron

File: `vercel.json` (aggiungi)

```json
{
  "crons": [
    {
      "path": "/api/cron/affiliate-emails",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Esegue ogni giorno alle 9:00 UTC (10:00 Italia).

---

## CHECKLIST

- [ ] Migrazione database eseguita
- [ ] Template base creato
- [ ] Template T1 creato
- [ ] Template D1-D7 creati (7 file)
- [ ] Template N1-N7 creati (7 file)
- [ ] Template E1 creato
- [ ] API invio email funzionante
- [ ] Job cron configurato
- [ ] Trigger notifiche integrati in API esistenti
- [ ] Test completo sequenza
- [ ] Test completo notifiche

---

## TEST

```bash
# 1. Test invio singola email
curl -X POST http://localhost:3000/api/affiliate/emails/send \
  -H "Content-Type: application/json" \
  -d '{"affiliateId":"UUID","emailType":"T1"}'

# 2. Test job cron
curl http://localhost:3000/api/cron/affiliate-emails \
  -H "Authorization: Bearer CRON_SECRET"

# 3. Verifica log
psql -c "SELECT * FROM affiliate_email_log ORDER BY sent_at DESC LIMIT 10;"
```

---

*Generato in conformità con VITAEOLOGY_MEGA_PROMPT v4.3*
