-- Fix views con SECURITY DEFINER rimaste
ALTER VIEW IF EXISTS public.challenge_user_progress SET (security_invoker = on);
ALTER VIEW IF EXISTS public.characteristics_with_exercise_count SET (security_invoker = on);
