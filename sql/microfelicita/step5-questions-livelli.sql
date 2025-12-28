-- STEP 5: Domande 3 Livelli (12 domande) - DIRECT
-- LIVELLO 1: CAMPO INTERNO (L1A-L1D)
INSERT INTO microfelicita_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('L1A', 'L1', 'Riconosco micro-momenti di benessere durante le mie routine quotidiane', 'direct', 36),
('L1B', 'L1', 'Uso le transizioni della giornata (mattino, pausa, sera) come momenti di presenza', 'direct', 37),
('L1C', 'L1', 'Ho sviluppato piccoli rituali che mi aiutano a notare il positivo', 'direct', 38),
('L1D', 'L1', 'Il mio corpo mi invia segnali di benessere che riesco a percepire', 'direct', 39),
-- LIVELLO 2: SPAZIO RELAZIONALE (L2A-L2D)
('L2A', 'L2', 'Noto i segnali non verbali nelle conversazioni (tono, postura, micro-espressioni)', 'direct', 40),
('L2B', 'L2', 'Percepisco quando una relazione ha "rumore" che impedisce il vero incontro', 'direct', 41),
('L2C', 'L2', 'Riconosco i micro-momenti di connessione autentica con le persone', 'direct', 42),
('L2D', 'L2', 'So quando sto ascoltando davvero l''altro e quando sto solo sentendo parole', 'direct', 43),
-- LIVELLO 3: CAMPO DEI CONTESTI (L3A-L3D)
('L3A', 'L3', 'Percepisco il "clima" di una stanza o di un gruppo appena entro', 'direct', 44),
('L3B', 'L3', 'Noto quando un gruppo accelera troppo e perde lucidità', 'direct', 45),
('L3C', 'L3', 'La mia presenza può influenzare positivamente il ritmo di una riunione', 'direct', 46),
('L3D', 'L3', 'Riconosco i momenti in cui un gruppo ha bisogno di una pausa anche se nessuno lo dice', 'direct', 47)
ON CONFLICT (code) DO NOTHING;
