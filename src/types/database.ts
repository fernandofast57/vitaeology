// Types per Vitaeology Database
// Generati manualmente - aggiornare con: pnpm db:generate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Pillars
export type Pillar = 'ESSERE' | 'SENTIRE' | 'PENSARE' | 'AGIRE'

// Answer types
export type AnswerType = 'VERO' | 'INCERTO' | 'FALSO'

// Scoring types
export type ScoringType = 'direct' | 'inverse'

// Subscription tiers (allineato a src/config/pricing.ts - SINGLE SOURCE OF TRUTH)
export type SubscriptionTier = 'explorer' | 'leader' | 'mentor' | 'mastermind'

// User Profile
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: SubscriptionTier
  subscription_status: 'active' | 'canceled' | 'past_due' | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

// Leadership Characteristic
export interface Characteristic {
  id: number
  book_id: number
  pillar: Pillar
  name: string
  description: string | null
  order_index: number
  created_at: string
}

// Assessment Question (DEPRECATED - usa AssessmentQuestionV2)
export interface AssessmentQuestion {
  id: number
  book_id: number
  characteristic_id: number
  question_text: string
  scoring_type: ScoringType
  order_index: number
  created_at: string
}

// Assessment Question V2 (ATTIVO - tabella: assessment_questions_v2)
export interface AssessmentQuestionV2 {
  id: number
  characteristic_id: number
  code: string
  question_text: string
  question_type: 'passive' | 'interlocutory' | 'active' | 'standard'
  scoring_type: ScoringType
  order_index: number
  is_lite: boolean
  is_active: boolean
  created_at: string
}

// User Assessment (DEPRECATED - usa UserAssessmentV2)
export interface UserAssessment {
  id: string
  user_id: string
  book_id: number
  status: 'in_progress' | 'completed'
  started_at: string
  completed_at: string | null
  total_score: number | null
  created_at: string
}

// User Assessment V2 (ATTIVO - tabella: user_assessments_v2)
export interface UserAssessmentV2 {
  id: string
  user_id: string
  assessment_type: 'leadership' | 'full'
  status: 'in_progress' | 'completed' | 'abandoned'
  current_question_index: number
  started_at: string
  completed_at: string | null
  created_at: string
}

// User Answer (DEPRECATED - usa UserAssessmentAnswerV2)
export interface UserAnswer {
  id: string
  assessment_id: string
  question_id: number
  answer: AnswerType
  points_earned: number
  answered_at: string
}

// User Assessment Answer V2 (ATTIVO - tabella: user_assessment_answers_v2)
export interface UserAssessmentAnswerV2 {
  id: string
  assessment_id: string
  question_id: number
  raw_score: number
  normalized_score: number
  answered_at: string
}

// Characteristic Score
export interface CharacteristicScore {
  id: string
  assessment_id: string
  characteristic_id: number
  total_points: number
  max_points: number
  score_percentage: number
  created_at: string
}

// Exercise
export interface Exercise {
  id: number
  book_id: number
  characteristic_id: number | null
  week_number: number
  title: string
  description: string | null
  instructions: string | null
  duration_minutes: number | null
  difficulty: 'facile' | 'medio' | 'difficile'
  is_premium: boolean
  created_at: string
}

// User Exercise Progress
export interface UserExerciseProgress {
  id: string
  user_id: string
  exercise_id: number
  status: 'not_started' | 'in_progress' | 'completed'
  notes: string | null
  rating: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      characteristics: {
        Row: Characteristic
        Insert: Omit<Characteristic, 'id' | 'created_at'>
        Update: Partial<Omit<Characteristic, 'id' | 'created_at'>>
      }
      assessment_questions: {
        Row: AssessmentQuestion
        Insert: Omit<AssessmentQuestion, 'id' | 'created_at'>
        Update: Partial<Omit<AssessmentQuestion, 'id' | 'created_at'>>
      }
      user_assessments: {
        Row: UserAssessment
        Insert: Omit<UserAssessment, 'id' | 'created_at'>
        Update: Partial<Omit<UserAssessment, 'id' | 'created_at'>>
      }
      user_answers: {
        Row: UserAnswer
        Insert: Omit<UserAnswer, 'id'>
        Update: Partial<Omit<UserAnswer, 'id'>>
      }
      characteristic_scores: {
        Row: CharacteristicScore
        Insert: Omit<CharacteristicScore, 'id' | 'created_at'>
        Update: Partial<Omit<CharacteristicScore, 'id' | 'created_at'>>
      }
      exercises: {
        Row: Exercise
        Insert: Omit<Exercise, 'id' | 'created_at'>
        Update: Partial<Omit<Exercise, 'id' | 'created_at'>>
      }
      user_exercise_progress: {
        Row: UserExerciseProgress
        Insert: Omit<UserExerciseProgress, 'id' | 'created_at'>
        Update: Partial<Omit<UserExerciseProgress, 'id' | 'created_at'>>
      }
    }
  }
}
