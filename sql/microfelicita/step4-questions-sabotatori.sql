-- STEP 4: Domande Sabotatori (15 domande) - INVERSE
-- MINIMIZZAZIONE ISTANTANEA (SM01-SM03)
INSERT INTO microfelicita_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('SM01', 'SM', 'Quando noto qualcosa di piacevole, penso subito "non è niente di speciale"', 'inverse', 21),
('SM02', 'SM', 'Tendo a sminuire i momenti positivi con frasi come "è solo un attimo"', 'inverse', 22),
('SM03', 'SM', 'I miei micro-momenti di benessere vengono rapidamente etichettati come insignificanti', 'inverse', 23),
-- ANTICIPO PROTETTIVO (SA01-SA03)
('SA01', 'SA', 'Quando mi sento bene, subito penso a cosa potrebbe andare storto dopo', 'inverse', 24),
('SA02', 'SA', 'La mia mente anticipa problemi futuri anche durante momenti piacevoli', 'inverse', 25),
('SA03', 'SA', 'Faccio fatica a godermi il presente perché penso già a domani', 'inverse', 26),
-- AUTO-INTERRUZIONE COGNITIVA (SI01-SI03)
('SI01', 'SI', 'Quando noto qualcosa di positivo, inizio subito ad analizzare "perché mi succede?"', 'inverse', 27),
('SI02', 'SI', 'Interrompo i momenti piacevoli con pensieri come "dovrei goderne di più"', 'inverse', 28),
('SI03', 'SI', 'La mia mente commenta le esperienze positive invece di viverle', 'inverse', 29),
-- CAMBIO DI FUOCO IMMEDIATO (SC01-SC03)
('SC01', 'SC', 'I miei momenti di benessere vengono interrotti da pensieri su cose da fare', 'inverse', 30),
('SC02', 'SC', 'Faccio fatica a restare su qualcosa di piacevole perché la mente salta ad altro', 'inverse', 31),
('SC03', 'SC', 'Notifiche, compiti o preoccupazioni catturano la mia attenzione più dei segnali positivi', 'inverse', 32),
-- CORREZIONE EMOTIVA (SE01-SE03)
('SE01', 'SE', 'Quando mi sento troppo bene, sento il bisogno di "tornare con i piedi per terra"', 'inverse', 33),
('SE02', 'SE', 'Mi dico "meglio non abituarmi" quando qualcosa va bene', 'inverse', 34),
('SE03', 'SE', 'Tendo a ridurre l''intensità delle emozioni positive per mantenere un equilibrio', 'inverse', 35)
ON CONFLICT (code) DO NOTHING;
