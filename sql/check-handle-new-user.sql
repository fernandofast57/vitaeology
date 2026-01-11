-- Verifica la funzione handle_new_user
SELECT prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';
