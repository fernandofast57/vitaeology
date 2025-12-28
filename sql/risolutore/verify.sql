-- Verifica setup Risolutore
SELECT 'dimensioni' as tabella, COUNT(*) as righe FROM risolutore_dimensions
UNION ALL
SELECT 'domande', COUNT(*) FROM risolutore_questions
UNION ALL
SELECT 'results', COUNT(*) FROM risolutore_results
UNION ALL
SELECT 'level_results', COUNT(*) FROM risolutore_level_results
UNION ALL
SELECT 'answers', COUNT(*) FROM risolutore_answers;
