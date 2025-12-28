-- STEP 5: Domande Scala Risolutore (SR01-SR12) - 12 domande con level_group
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index, level_group) VALUES
('SR01', 'SR', 'Applico consapevolmente una strategia prima di affrontare un problema', 'direct', 37, 1),
('SR02', 'SR', 'Documento le mie soluzioni per poterle replicare in futuro', 'direct', 38, 1),
('SR03', 'SR', 'Ottengo risultati consistenti quando affronto problemi nel mio ambito', 'direct', 39, 1),
('SR04', 'SR', 'Ho sviluppato un metodo personale per gestire le difficoltà ricorrenti', 'direct', 40, 1),
('SR05', 'SR', 'Altri mi cercano per avere il mio punto di vista su problemi complessi', 'direct', 41, 2),
('SR06', 'SR', 'Riesco a influenzare i processi del mio team o organizzazione', 'direct', 42, 2),
('SR07', 'SR', 'Prendo decisioni autonome su questioni importanti nel mio ambito', 'direct', 43, 2),
('SR08', 'SR', 'Ho guadagnato credibilità come "persona che risolve" nel mio ambiente', 'direct', 44, 2),
('SR09', 'SR', 'Insegno ad altri come affrontare problemi in modo sistematico', 'direct', 45, 3),
('SR10', 'SR', 'Le mie soluzioni hanno impatto oltre il mio team o reparto', 'direct', 46, 3),
('SR11', 'SR', 'Contribuisco a cambiare il modo in cui la mia organizzazione affronta i problemi', 'direct', 47, 3),
('SR12', 'SR', 'Creo le condizioni perché altri sviluppino le proprie capacità risolutive', 'direct', 48, 3)
ON CONFLICT (code) DO NOTHING;
