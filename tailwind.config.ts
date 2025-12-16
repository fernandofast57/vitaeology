import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ========================================
        // Brand Colors Vitaeology (esistenti)
        // ========================================
        petrol: {
          50: '#E6EAED',
          100: '#C0CAD4',
          200: '#96A7B8',
          300: '#6C849C',
          400: '#4D6987',
          500: '#2E4F72',
          600: '#0A2540', // PRIMARY - Blu Petrolio
          700: '#081D33',
          800: '#061526',
          900: '#040E19',
        },
        gold: {
          50: '#FEF9E7',
          100: '#FCF0C3',
          200: '#FAE69B',
          300: '#F8DC73',
          400: '#F6D355',
          500: '#F4B942', // PRIMARY - Oro
          600: '#D9A438',
          700: '#B8892F',
          800: '#976E26',
          900: '#76531D',
        },
        
        // ========================================
        // ALIAS per componenti Dashboard (NUOVI)
        // ========================================
        primary: {
          DEFAULT: '#0A2540', // = petrol-600
          light: '#2E4F72',   // = petrol-500
          dark: '#061526',    // = petrol-800
        },
        accent: {
          DEFAULT: '#F4B942', // = gold-500
          light: '#F6D355',   // = gold-400
          dark: '#D9A438',    // = gold-600
        },
        neutral: {
          pearl: '#E8E8E8',   // Grigio Perla (bordi, separatori)
        },
        
        // ========================================
        // Colori pilastri leadership (per radar chart)
        // ========================================
        pillar: {
          // Nomi originali (4 pilastri assessment)
          being: '#3B82F6',      // Blu - Essere
          feeling: '#10B981',    // Verde - Sentire  
          thinking: '#8B5CF6',   // Viola - Pensare
          acting: '#F59E0B',     // Arancione - Agire
          // Alias inglesi (usati nei componenti)
          vision: '#3B82F6',     // = being
          relations: '#10B981',  // = feeling
          adaptation: '#8B5CF6', // = thinking
          action: '#F59E0B',     // = acting
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        // Alias per componenti
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      // ========================================
      // Utilities aggiuntive Vitaeology
      // ========================================
      borderRadius: {
        'vitae': '0.75rem', // 12px standard
      },
      boxShadow: {
        'vitae': '0 1px 3px rgba(10, 37, 64, 0.1), 0 1px 2px rgba(10, 37, 64, 0.06)',
        'vitae-lg': '0 10px 15px -3px rgba(10, 37, 64, 0.1), 0 4px 6px -2px rgba(10, 37, 64, 0.05)',
      },
    },
  },
  plugins: [],
}

export default config