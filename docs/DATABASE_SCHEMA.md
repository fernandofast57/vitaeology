# VITAEOLOGY - DATABASE SCHEMA

Schema completo del database PostgreSQL (Supabase).

---

## DIAGRAMMA RELAZIONI

```
                                    ┌─────────────────┐
                                    │   auth.users    │
                                    │   (Supabase)    │
                                    └────────┬────────┘
                                             │ 1:1
                                             ▼
┌─────────────┐    1:N    ┌─────────────────────────────────┐    1:N    ┌──────────────────┐
│    roles    │◄──────────│           profiles              │──────────▶│ user_assessments │
└─────────────┘           └─────────────────────────────────┘           └──────────────────┘
                                    │         │         │                        │
                                    │         │         │                        │ 1:N
                                    │         │         │                        ▼
                                    │         │         │               ┌──────────────────┐
                                    │         │         │               │   user_answers   │
                                    │         │         │               └──────────────────┘
                                    │         │         │
                    ┌───────────────┘         │         └───────────────┐
                    │                         │                         │
                    ▼ 1:N                     ▼ 1:N                     ▼ 1:N
    ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
    │ ai_coach_conversations│   │ user_exercise_progress│   │ characteristic_scores │
    └───────────────────────┘   └───────────────────────┘   └───────────────────────┘
                                            │                          │
                                            │                          │
                                            ▼ N:1                      ▼ N:1
                                    ┌───────────────┐          ┌─────────────────┐
                                    │   exercises   │          │ characteristics │
                                    └───────────────┘          └─────────────────┘
                                            │                          │
                                            │ N:1                      │ N:1
                                            ▼                          ▼
                                    ┌─────────────────┐        ┌───────────────┐
                                    │ characteristics │        │     books     │
                                    └─────────────────┘        └───────────────┘
```

---

## TABELLE DETTAGLIATE

### 1. profiles

Estende `auth.users` con dati applicativi.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,

  -- Subscription
  subscription_tier TEXT DEFAULT 'free',  -- free, leader, mentor
  subscription_status TEXT DEFAULT 'active',  -- active, canceled, past_due
  stripe_customer_id TEXT UNIQUE,

  -- Percorso attuale
  current_path TEXT,  -- leadership, problemi, benessere

  -- Admin
  is_admin BOOLEAN DEFAULT false,
  role_id UUID REFERENCES roles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Trigger: auto-create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
```

---

### 2. roles

Sistema RBAC.

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,  -- admin, staff, member
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed
INSERT INTO roles (name, description) VALUES
  ('admin', 'Amministratore completo'),
  ('staff', 'Staff con accesso parziale'),
  ('member', 'Utente standard');
```

---

### 3. books

I 3 libri/percorsi.

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,  -- leadership, risolutore, microfelicita
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed
INSERT INTO books (title, slug) VALUES
  ('Leadership Autentica', 'leadership'),
  ('Oltre gli Ostacoli', 'risolutore'),
  ('Microfelicità Digitale', 'microfelicita');
```

---

### 4. characteristics

24 caratteristiche di leadership (6 per pilastro).

```sql
CREATE TABLE characteristics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id),

  -- Pilastro
  pillar TEXT NOT NULL,  -- ESSERE, SENTIRE, PENSARE, AGIRE
  pillar_order INTEGER,  -- 1, 2, 3, 4

  -- Caratteristica
  name TEXT NOT NULL,
  name_familiar TEXT,  -- slug: autenticita, empatia, etc.
  description TEXT,
  order_index INTEGER,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24 righe totali (6 × 4 pilastri)
```

---

### 5. assessment_questions

167 domande totali (72 Leadership + 48 Risolutore + 47 Microfelicità).

```sql
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id),
  characteristic_id UUID REFERENCES characteristics(id),

  -- Domanda
  question_text TEXT NOT NULL,
  question_type TEXT,  -- passive, interlocutory, active, standard
  scoring_type TEXT NOT NULL,  -- direct, inverse

  -- Ordinamento
  order_index INTEGER,
  code TEXT,  -- es: L01, R15

  -- Tipo Assessment
  assessment_type TEXT DEFAULT 'leadership',  -- leadership, risolutore, microfelicita

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 167 righe totali:
-- Leadership: 72 (3 × 24 caratteristiche)
-- Risolutore: 48 (3 Filtri)
-- Microfelicità: 47 (5 fasi R.A.D.A.R.)
```

---

### 6. user_assessments

Sessioni assessment utente.

```sql
CREATE TABLE user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id),

  -- Stato
  status TEXT DEFAULT 'in_progress',  -- in_progress, completed
  assessment_version TEXT DEFAULT 'lite',  -- full, lite

  -- Progresso
  current_question_index INTEGER DEFAULT 0,

  -- Punteggi finali
  total_score DECIMAL(5,2),

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 7. user_answers

Risposte singole assessment.

```sql
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES user_assessments(id) ON DELETE CASCADE,
  question_id UUID REFERENCES assessment_questions(id),

  -- Risposta
  raw_score INTEGER NOT NULL,  -- 1-5
  normalized_score INTEGER,  -- dopo inverse scoring

  answered_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(assessment_id, question_id)
);
```

---

### 8. characteristic_scores

Punteggi per caratteristica (calcolati al completamento).

```sql
CREATE TABLE characteristic_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES user_assessments(id),
  characteristic_id UUID REFERENCES characteristics(id),

  score DECIMAL(5,2),  -- media normalizzata 1-5
  percentage DECIMAL(5,2),  -- 0-100

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(assessment_id, characteristic_id)
);
```

---

### 9. exercises

52 esercizi settimanali.

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Settimana
  week_number INTEGER NOT NULL,  -- 1-52

  -- Collegamento caratteristica
  characteristic_id UUID REFERENCES characteristics(id),

  -- Contenuto
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  slug TEXT UNIQUE,

  -- Tipo e difficoltà
  exercise_type TEXT,  -- reflection, action, discovery, integration, challenge
  difficulty_level TEXT DEFAULT 'base',  -- base, intermedio, avanzato

  -- Tempo
  estimated_time_minutes INTEGER DEFAULT 15,

  -- Contenuto dettagliato
  content TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,

  -- Accesso per tier
  required_tier TEXT DEFAULT 'explorer',  -- explorer, leader, mentor

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
```

---

### 10. user_exercise_progress

Progresso esercizi per utente.

```sql
CREATE TABLE user_exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),

  -- Stato
  status TEXT DEFAULT 'not_started',  -- not_started, in_progress, completed

  -- Tracking
  attempts INTEGER DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,

  UNIQUE(user_id, exercise_id)
);
```

---

### 11. ai_coach_conversations

Storico conversazioni AI Coach.

```sql
CREATE TABLE ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Messaggio
  role TEXT NOT NULL,  -- user, assistant
  content TEXT NOT NULL,

  -- Contesto
  exercise_id UUID REFERENCES exercises(id),
  context_type TEXT,  -- assessment, exercise, general
  session_id TEXT,

  -- Metriche
  tokens_used INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: utente vede solo proprie conversazioni
CREATE POLICY "Users can view own conversations"
  ON ai_coach_conversations FOR SELECT
  USING (auth.uid() = user_id);
```

---

### 12. ai_coach_user_memory

Memoria personalizzazione AI Coach.

```sql
CREATE TABLE ai_coach_user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Preferenze comunicazione
  communication_style TEXT DEFAULT 'socratic',  -- directive, socratic, storytelling
  preferred_response_length TEXT DEFAULT 'moderate',  -- brief, moderate, detailed

  -- Pattern rilevati
  common_challenges TEXT[] DEFAULT '{}',
  successful_approaches TEXT[] DEFAULT '{}',
  trigger_topics TEXT[] DEFAULT '{}',

  -- Tratti personalità
  personality_traits JSONB DEFAULT '{}'::jsonb,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 13. ai_coach_feedback

Feedback su messaggi AI.

```sql
CREATE TABLE ai_coach_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_coach_conversations(id),
  user_id UUID REFERENCES profiles(id),

  feedback TEXT,  -- positive, negative
  reason_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 14. challenge_subscribers

Iscritti alle 3 challenge.

```sql
CREATE TABLE challenge_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contatto
  email TEXT NOT NULL,
  nome TEXT,

  -- Challenge
  challenge TEXT NOT NULL,  -- leadership-autentica, oltre-ostacoli, microfelicita

  -- A/B Testing
  variant TEXT DEFAULT 'A',  -- A, B, C

  -- UTM Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Stato
  status TEXT DEFAULT 'active',  -- active, completed, unsubscribed
  current_day INTEGER DEFAULT 0,  -- 0-7

  -- Email tracking
  last_email_sent_at TIMESTAMPTZ,
  last_email_type TEXT,  -- welcome, day_content, reminder, force_advance, recovery

  -- Conversione
  converted_to_assessment BOOLEAN DEFAULT false,

  -- Timestamps
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(email, challenge)
);
```

---

### 15. challenge_discovery_responses

Risposte quiz discovery (A/B/C).

```sql
CREATE TABLE challenge_discovery_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES challenge_subscribers(id),

  challenge TEXT NOT NULL,
  day_number INTEGER NOT NULL,  -- 1-7
  question_number INTEGER NOT NULL,  -- 1-3

  response TEXT NOT NULL,  -- A, B, C

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(subscriber_id, challenge, day_number, question_number)
);
```

---

### 16. challenge_day_completions

Giorni completati per subscriber.

```sql
CREATE TABLE challenge_day_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES challenge_subscribers(id),

  challenge TEXT NOT NULL,
  day_number INTEGER NOT NULL,  -- 1-7

  email_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(subscriber_id, challenge, day_number)
);
```

---

### 17. ab_test_events

Eventi per A/B testing.

```sql
CREATE TABLE ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  challenge TEXT NOT NULL,
  variant TEXT NOT NULL,  -- A, B, C

  event_type TEXT NOT NULL,  -- signup, day_completed, assessment_started, converted
  subscriber_id UUID,

  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 18. book_chunks (RAG)

Chunks dei libri per RAG con embeddings.

```sql
CREATE TABLE book_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Libro
  book_title TEXT NOT NULL,
  chapter TEXT,
  section TEXT,

  -- Contenuto
  content TEXT NOT NULL,
  chunk_type TEXT,  -- intro, concept, example, exercise
  keywords TEXT[] DEFAULT '{}',

  -- Embedding (OpenAI text-embedding-3-small)
  embedding VECTOR(1536),

  -- Path per filtro
  current_path TEXT,  -- leadership, problemi, benessere

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funzione match per similarity search
CREATE FUNCTION match_book_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 3,
  filter_path TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  book_title TEXT,
  chapter TEXT,
  section TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bc.id,
    bc.book_title,
    bc.chapter,
    bc.section,
    bc.content,
    1 - (bc.embedding <=> query_embedding) AS similarity
  FROM book_chunks bc
  WHERE
    (filter_path IS NULL OR bc.current_path = filter_path)
    AND 1 - (bc.embedding <=> query_embedding) > match_threshold
  ORDER BY bc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## INDICI

```sql
-- Performance queries
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_stripe ON profiles(stripe_customer_id);
CREATE INDEX idx_exercises_week ON exercises(week_number);
CREATE INDEX idx_exercises_char ON exercises(characteristic_id);
CREATE INDEX idx_user_progress_user ON user_exercise_progress(user_id);
CREATE INDEX idx_conversations_user ON ai_coach_conversations(user_id);
CREATE INDEX idx_subscribers_email ON challenge_subscribers(email);
CREATE INDEX idx_subscribers_status ON challenge_subscribers(status);

-- Vector similarity (pgvector)
CREATE INDEX idx_chunks_embedding ON book_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

---

## RLS POLICIES

```sql
-- Tutte le tabelle utente hanno RLS attivo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE characteristic_scores ENABLE ROW LEVEL SECURITY;

-- Policy esempio
CREATE POLICY "Users can view own data"
  ON user_exercise_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON user_exercise_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON user_exercise_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

---

*Ultimo aggiornamento: 26 Dicembre 2024*
