-- =====================================================
-- VITAEOLOGY - Database Schema per Supabase
-- =====================================================
-- Esegui questo script su: Supabase Dashboard → SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'leader', 'mentor')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger per creare profile automaticamente dopo signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. BOOKS (per supporto multi-libro futuro)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert libro "Leadership Autentica"
INSERT INTO public.books (id, title, slug, description) VALUES
  (1, 'Leadership Autentica', 'leadership-autentica', 'Sviluppa le 24 caratteristiche del leader autentico')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 3. CHARACTERISTICS (24 caratteristiche leadership)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.characteristics (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES public.books(id),
  pillar TEXT NOT NULL CHECK (pillar IN ('ESSERE', 'SENTIRE', 'PENSARE', 'AGIRE')),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert 24 caratteristiche
INSERT INTO public.characteristics (book_id, pillar, name, description, order_index) VALUES
  -- ESSERE (1-6)
  (1, 'ESSERE', 'Autenticità', 'Essere genuini e coerenti con i propri valori', 1),
  (1, 'ESSERE', 'Integrità', 'Agire con onestà e principi morali solidi', 2),
  (1, 'ESSERE', 'Consapevolezza di Sé', 'Conoscere i propri punti di forza e debolezze', 3),
  (1, 'ESSERE', 'Presenza', 'Essere pienamente presenti nel momento', 4),
  (1, 'ESSERE', 'Resilienza', 'Capacità di riprendersi dalle difficoltà', 5),
  (1, 'ESSERE', 'Umiltà', 'Riconoscere i propri limiti e valorizzare gli altri', 6),
  -- SENTIRE (7-12)
  (1, 'SENTIRE', 'Empatia', 'Comprendere e condividere le emozioni altrui', 7),
  (1, 'SENTIRE', 'Intelligenza Emotiva', 'Gestire le proprie emozioni e quelle degli altri', 8),
  (1, 'SENTIRE', 'Ascolto Attivo', 'Ascoltare con attenzione e comprensione', 9),
  (1, 'SENTIRE', 'Compassione', 'Mostrare cura genuina per il benessere altrui', 10),
  (1, 'SENTIRE', 'Fiducia', 'Costruire e mantenere relazioni di fiducia', 11),
  (1, 'SENTIRE', 'Gratitudine', 'Apprezzare e riconoscere il valore degli altri', 12),
  -- PENSARE (13-18)
  (1, 'PENSARE', 'Visione Strategica', 'Vedere il quadro generale e pianificare', 13),
  (1, 'PENSARE', 'Pensiero Critico', 'Analizzare situazioni con obiettività', 14),
  (1, 'PENSARE', 'Creatività', 'Generare idee innovative e soluzioni originali', 15),
  (1, 'PENSARE', 'Adattabilità', 'Modificare approccio in base al contesto', 16),
  (1, 'PENSARE', 'Apprendimento Continuo', 'Desiderio costante di crescere e imparare', 17),
  (1, 'PENSARE', 'Problem Solving', 'Risolvere problemi in modo efficace', 18),
  -- AGIRE (19-24)
  (1, 'AGIRE', 'Decisionalità', 'Prendere decisioni tempestive e ponderate', 19),
  (1, 'AGIRE', 'Comunicazione', 'Esprimersi in modo chiaro e persuasivo', 20),
  (1, 'AGIRE', 'Delega', 'Affidare responsabilità in modo efficace', 21),
  (1, 'AGIRE', 'Motivazione', 'Ispirare e motivare gli altri all azione', 22),
  (1, 'AGIRE', 'Accountability', 'Assumersi la responsabilità dei risultati', 23),
  (1, 'AGIRE', 'Execution', 'Trasformare piani in risultati concreti', 24)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. ASSESSMENT_QUESTIONS (240 domande)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES public.books(id),
  characteristic_id INTEGER NOT NULL REFERENCES public.characteristics(id),
  question_text TEXT NOT NULL,
  scoring_type TEXT NOT NULL DEFAULT 'direct' CHECK (scoring_type IN ('direct', 'inverse')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. USER_ASSESSMENTS (sessioni test utenti)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES public.books(id),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. USER_ANSWERS (risposte utenti)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.user_assessments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES public.assessment_questions(id),
  answer TEXT NOT NULL CHECK (answer IN ('VERO', 'INCERTO', 'FALSO')),
  points_earned INTEGER NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

-- =====================================================
-- 7. CHARACTERISTIC_SCORES (punteggi per caratteristica)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.characteristic_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.user_assessments(id) ON DELETE CASCADE,
  characteristic_id INTEGER NOT NULL REFERENCES public.characteristics(id),
  total_points INTEGER NOT NULL,
  max_points INTEGER NOT NULL,
  score_percentage INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, characteristic_id)
);

-- =====================================================
-- 8. EXERCISES (52 esercizi settimanali)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES public.books(id),
  characteristic_id INTEGER REFERENCES public.characteristics(id),
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_minutes INTEGER,
  difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facile', 'medio', 'difficile')),
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. USER_EXERCISE_PROGRESS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_exercise_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES public.exercises(id),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characteristic_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_progress ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Assessments: users can only see/manage their own
CREATE POLICY "Users can view own assessments" ON public.user_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments" ON public.user_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON public.user_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- User Answers: users can only see/manage their own
CREATE POLICY "Users can view own answers" ON public.user_answers
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.user_assessments WHERE id = assessment_id)
  );

CREATE POLICY "Users can create own answers" ON public.user_answers
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.user_assessments WHERE id = assessment_id)
  );

CREATE POLICY "Users can update own answers" ON public.user_answers
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.user_assessments WHERE id = assessment_id)
  );

-- Characteristic Scores: users can only see their own
CREATE POLICY "Users can view own scores" ON public.characteristic_scores
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.user_assessments WHERE id = assessment_id)
  );

CREATE POLICY "Users can create own scores" ON public.characteristic_scores
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.user_assessments WHERE id = assessment_id)
  );

-- Exercise Progress: users can only see/manage their own
CREATE POLICY "Users can view own exercise progress" ON public.user_exercise_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exercise progress" ON public.user_exercise_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise progress" ON public.user_exercise_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for reference tables
CREATE POLICY "Anyone can view books" ON public.books
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view characteristics" ON public.characteristics
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view questions" ON public.assessment_questions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view exercises" ON public.exercises
  FOR SELECT USING (true);

-- =====================================================
-- INDEXES per performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_questions_book_id ON public.assessment_questions(book_id);
CREATE INDEX IF NOT EXISTS idx_questions_characteristic_id ON public.assessment_questions(characteristic_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON public.user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_assessment_id ON public.user_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_characteristic_scores_assessment_id ON public.characteristic_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_user_id ON public.user_exercise_progress(user_id);

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Prossimi step:
-- 1. Carica le 240 domande (vedi file seed_questions.sql)
-- 2. Carica i 52 esercizi (vedi file seed_exercises.sql)
-- =====================================================
