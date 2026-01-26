 # 🌱 Vitaeology - Leadership Autentica

Piattaforma SaaS per lo sviluppo della leadership destinata a imprenditori e manager di PMI italiane.

## 🎯 Features

- **Test Diagnostico**: 240 domande per valutare 24 caratteristiche di leadership
- **Radar Chart Interattivo**: Visualizzazione grafica dei risultati
- **4 Pilastri**: ESSERE, SENTIRE, PENSARE, AGIRE
- **52 Esercizi Settimanali**: Percorso guidato di un anno
- **Sistema Abbonamenti**: Integrazione Stripe

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deploy**: Vercel

## 📦 Setup Rapido

### 1. Clona e installa dipendenze

```bash
git clone https://github.com/fernandofast57/vitaeology.git
cd vitaeology
pnpm install
```

### 2. Configura Supabase

1. Vai su [supabase.com](https://supabase.com) → Crea nuovo progetto
2. Copia le API keys da: Settings → API
3. Esegui lo schema SQL: SQL Editor → Incolla contenuto di `supabase/schema.sql` → Run

### 3. Configura Environment Variables

```bash
cp .env.example .env.local
```

Compila `.env.local` con i tuoi valori:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Avvia in sviluppo

```bash
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000)

## 🎨 Brand Colors

- **Primary (Petrol Blue)**: `#0A2540`
- **Accent (Gold)**: `#F4B942`

## 📁 Struttura Progetto

```
vitaeology/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── auth/           # Login, Signup, Callback
│   │   ├── dashboard/      # Dashboard utente
│   │   ├── test/           # Test diagnostico
│   │   ├── results/        # Risultati + Radar Chart
│   │   └── api/            # API Routes
│   ├── components/         # Componenti React
│   ├── lib/                # Utilities, Supabase, Stripe
│   └── types/              # TypeScript types
├── supabase/
│   └── schema.sql          # Database schema
└── public/                 # Static assets
```

## 🚀 Deploy su Vercel

1. Push su GitHub
2. Vai su [vercel.com](https://vercel.com) → Import project
3. Aggiungi Environment Variables
4. Deploy!

## 📝 Prossimi Step

1. [ ] Caricare 240 domande assessment
2. [ ] Implementare pagina test con domande
3. [ ] Implementare calcolo score e radar chart
4. [ ] Integrare Stripe checkout
5. [ ] Caricare 52 esercizi

## 📄 License

Proprietary - © 2025 Vitaeology - Fernando Marongiu. Tutti i diritti riservati.
