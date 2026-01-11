-- Test inserimento diretto in profiles
INSERT INTO public.profiles (id, email, full_name, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@test.com',
  '',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Verifica
SELECT id, email FROM profiles WHERE email = 'test@test.com';

-- Rimuovi test
DELETE FROM profiles WHERE email = 'test@test.com';
