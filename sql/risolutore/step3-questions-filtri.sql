-- STEP 3: Domande Filtri (FP, FS, FR) - 18 domande
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('FP01', 'FP', 'Quando affronto un problema ricorrente, riesco a identificare lo schema che si ripete', 'direct', 1),
('FP02', 'FP', 'Noto collegamenti tra situazioni apparentemente diverse che altri non vedono', 'direct', 2),
('FP03', 'FP', 'Prima di agire su un problema, mi chiedo "quando è già successo qualcosa di simile?"', 'direct', 3),
('FP04', 'FP', 'Riconosco i segnali precoci che indicano l''arrivo di una difficoltà già vista', 'direct', 4),
('FP05', 'FP', 'Di fronte a una crisi, riesco a vedere il pattern sottostante invece di reagire al singolo evento', 'direct', 5),
('FP06', 'FP', 'Uso le esperienze passate come mappa per orientarmi in situazioni nuove', 'direct', 6),
('FS01', 'FS', 'Percepisco quando qualcuno ha bisogno di aiuto anche se non lo chiede esplicitamente', 'direct', 7),
('FS02', 'FS', 'Colgo il vero significato dietro le parole, non solo quello letterale', 'direct', 8),
('FS03', 'FS', 'Noto i cambiamenti di tono o di comportamento che indicano qualcosa di non detto', 'direct', 9),
('FS04', 'FS', 'Riesco a capire cosa preoccupa davvero le persone, oltre a quello che dichiarano', 'direct', 10),
('FS05', 'FS', 'Leggo l''atmosfera di una stanza appena entro, cogliendo tensioni o aperture', 'direct', 11),
('FS06', 'FS', 'Quando qualcuno dice "va tutto bene" ma non è vero, me ne accorgo', 'direct', 12),
('FR01', 'FR', 'Vedo risorse e possibilità dove altri vedono solo limiti', 'direct', 13),
('FR02', 'FR', 'Riesco a combinare elementi diversi per creare soluzioni non convenzionali', 'direct', 14),
('FR03', 'FR', 'Quando mancano risorse tradizionali, trovo alternative creative', 'direct', 15),
('FR04', 'FR', 'Identifico competenze e talenti nelle persone che loro stesse non riconoscono', 'direct', 16),
('FR05', 'FR', 'Trasformo vincoli in opportunità di innovazione', 'direct', 17),
('FR06', 'FR', 'Mi chiedo "cosa posso ottenere temporaneamente o in prestito?" invece di fermarmi a "non ce l''ho"', 'direct', 18)
ON CONFLICT (code) DO NOTHING;
