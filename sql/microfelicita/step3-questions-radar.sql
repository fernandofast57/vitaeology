-- STEP 3: Domande R.A.D.A.R. (20 domande) - DIRECT
-- RILEVA (RR01-RR04)
INSERT INTO microfelicita_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('RR01', 'RR', 'Noto piccoli dettagli piacevoli durante la giornata (luce, suoni, sensazioni)', 'direct', 1),
('RR02', 'RR', 'Percepisco i segnali di benessere del mio corpo anche quando sono sottili', 'direct', 2),
('RR03', 'RR', 'Mi accorgo di micro-momenti positivi mentre accadono, non solo dopo', 'direct', 3),
('RR04', 'RR', 'La mia attenzione coglie variazioni positive nell''ambiente senza che io le cerchi attivamente', 'direct', 4),
-- ACCOGLI (RA01-RA04)
('RA01', 'RA', 'Quando noto qualcosa di piacevole, riesco a lasciarlo essere senza giudicarlo', 'direct', 5),
('RA02', 'RA', 'Non sento il bisogno di analizzare immediatamente ogni esperienza positiva', 'direct', 6),
('RA03', 'RA', 'Accolgo i momenti di benessere senza chiedermi se li "merito"', 'direct', 7),
('RA04', 'RA', 'Lascio che le sensazioni positive restino presenti senza cercare di trattenerle o modificarle', 'direct', 8),
-- DISTINGUI (RD01-RD04)
('RD01', 'RD', 'Distinguo rapidamente tra ciò che mi fa davvero bene e ciò che sembra positivo ma non lo è', 'direct', 9),
('RD02', 'RD', 'Riconosco quando un pensiero apparentemente positivo nasconde ansia o pressione', 'direct', 10),
('RD03', 'RD', 'So distinguere un momento di vera calma da una semplice assenza di stimoli', 'direct', 11),
('RD04', 'RD', 'Identifico se una sensazione mi avvicina o mi allontana dal benessere autentico', 'direct', 12),
-- AMPLIFICA (RM01-RM04)
('RM01', 'RM', 'Riesco a restare su un dettaglio piacevole per qualche secondo senza che la mente salti altrove', 'direct', 13),
('RM02', 'RM', 'Quando noto qualcosa di bello, mi concedo un momento per apprezzarlo davvero', 'direct', 14),
('RM03', 'RM', 'So mantenere l''attenzione su una sensazione positiva abbastanza da consolidarla', 'direct', 15),
('RM04', 'RM', 'Non passo immediatamente al pensiero successivo dopo aver notato qualcosa di piacevole', 'direct', 16),
-- RESTA (RS01-RS04)
('RS01', 'RS', 'Dopo aver notato un momento positivo, lascio che si completi naturalmente', 'direct', 17),
('RS02', 'RS', 'Non interrompo bruscamente le esperienze piacevoli per passare ad altro', 'direct', 18),
('RS03', 'RS', 'Permetto una transizione graduale dopo un micro-momento di benessere', 'direct', 19),
('RS04', 'RS', 'Sento che i momenti positivi si "consolidano" invece di dissolversi subito', 'direct', 20)
ON CONFLICT (code) DO NOTHING;
