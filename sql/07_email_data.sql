-- =============================================
-- BLOCCO 7/7: DATI EMAIL SEQUENCES
-- Esegui dopo blocco 6
-- =============================================

-- FUNNEL LEADERSHIP (5 email)
INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('leadership', 1, 0, 0, 'lead_magnet_request', 
   'Il tuo risultato: ecco la caratteristica che già possiedi', 
   'Scopri cosa dice il quiz sul tuo stile di leadership')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('leadership', 2, 1, 0, 'previous_email', 
   'Perché quella caratteristica è già un tuo punto di forza', 
   'Non è un caso che sia emersa proprio quella')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('leadership', 3, 3, 0, 'previous_email', 
   'Come Fernando ha scoperto le sue 24 caratteristiche', 
   'La storia dietro il framework')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('leadership', 4, 5, 0, 'previous_email', 
   'Il libro che raccoglie tutto: Leadership Autentica', 
   'Disponibile su Amazon + accesso esclusivo')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('leadership', 5, 7, 0, 'previous_email', 
   'Ultima possibilità: il bonus scade domani', 
   'Accesso alla piattaforma incluso')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

-- FUNNEL PROBLEMI (5 email)
INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('problemi', 1, 0, 0, 'lead_magnet_request', 
   'Ecco i tuoi 3 Filtri del Risolutore', 
   'Il PDF è pronto per il download')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('problemi', 2, 1, 0, 'previous_email', 
   'Come usare il primo filtro già oggi', 
   'Un esercizio pratico di 5 minuti')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('problemi', 3, 3, 0, 'previous_email', 
   'L''errore che fa il 90% delle persone con i problemi', 
   'E come evitarlo')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('problemi', 4, 5, 0, 'previous_email', 
   'Oltre gli Ostacoli: il sistema completo', 
   'Il libro è disponibile')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('problemi', 5, 7, 0, 'previous_email', 
   'Bonus esclusivo per chi agisce questa settimana', 
   'Accesso anticipato alla piattaforma')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

-- FUNNEL BENESSERE (5 email)
INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('benessere', 1, 0, 0, 'lead_magnet_request', 
   'La tua meditazione R.A.D.A.R. è pronta', 
   '10 minuti per ritrovare equilibrio')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('benessere', 2, 1, 0, 'previous_email', 
   'Hai provato la meditazione? Ecco cosa succede dopo', 
   'Il secondo ascolto è diverso')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('benessere', 3, 3, 0, 'previous_email', 
   'Le 5 microfelicità che cambiano la giornata', 
   'Piccoli momenti, grande impatto')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('benessere', 4, 5, 0, 'previous_email', 
   'Microfelicità: il libro che ti insegna a trovarle ovunque', 
   'Disponibile ora')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

INSERT INTO public.email_sequences 
  (funnel, sequence_position, delay_days, delay_hours, trigger_event, subject, preview_text) 
VALUES
  ('benessere', 5, 7, 0, 'previous_email', 
   'Ultimo giorno per il pacchetto completo', 
   'Libro + accesso piattaforma')
ON CONFLICT (funnel, sequence_position) DO NOTHING;

-- Verifica finale
SELECT funnel, COUNT(*) as email_count 
FROM public.email_sequences 
GROUP BY funnel 
ORDER BY funnel;
