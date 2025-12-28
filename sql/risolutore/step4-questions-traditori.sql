-- STEP 4: Domande Traditori (TP, TT, TC) - 18 domande INVERSE
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('TP01', 'TP', 'Aspetto di avere tutte le informazioni prima di fare il primo passo', 'inverse', 19),
('TP02', 'TP', 'L''idea di sbagliare mi blocca più della difficoltà stessa del problema', 'inverse', 20),
('TP03', 'TP', 'Rimugino a lungo sulle possibili conseguenze negative prima di agire', 'inverse', 21),
('TP04', 'TP', 'Preferisco non decidere piuttosto che rischiare una decisione sbagliata', 'inverse', 22),
('TP05', 'TP', 'Quando un problema sembra complesso, mi sento sopraffatto e non so da dove iniziare', 'inverse', 23),
('TP06', 'TP', 'La ricerca della perfezione mi impedisce di completare i progetti', 'inverse', 24),
('TT01', 'TT', 'Evito di proporre soluzioni per paura che vengano criticate', 'inverse', 25),
('TT02', 'TT', 'Mi preoccupo più di cosa penseranno gli altri che di risolvere il problema', 'inverse', 26),
('TT03', 'TT', 'Preferisco non espormi anche quando ho un''idea che potrebbe funzionare', 'inverse', 27),
('TT04', 'TT', 'Il timore di sembrare incompetente mi frena dal chiedere aiuto', 'inverse', 28),
('TT05', 'TT', 'Minimizzo i miei contributi per non attirare troppa attenzione', 'inverse', 29),
('TT06', 'TT', 'Ho difficoltà a sostenere le mie posizioni quando vengono messe in discussione', 'inverse', 30),
('TC01', 'TC', 'So cosa dovrei fare ma trovo sempre un motivo per rimandare', 'inverse', 31),
('TC02', 'TC', 'Le attività urgenti hanno sempre la precedenza su quelle importanti', 'inverse', 32),
('TC03', 'TC', 'Inizio molti progetti con entusiasmo ma fatico a portarli a termine', 'inverse', 33),
('TC04', 'TC', 'Mi dico "lo faccio domani" anche per cose che potrei fare oggi', 'inverse', 34),
('TC05', 'TC', 'Dedico tempo a preparare invece che a fare, anche quando sono già pronto', 'inverse', 35),
('TC06', 'TC', 'Le scadenze sono l''unica cosa che mi fa passare all''azione', 'inverse', 36)
ON CONFLICT (code) DO NOTHING;
