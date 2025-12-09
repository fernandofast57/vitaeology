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
        // Brand Colors Vitaeology
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
        // Colori pilastri leadership (per radar chart)
        pillar: {
          being: '#3B82F6',      // Blu - Essere
          feeling: '#10B981',    // Verde - Sentire  
          thinking: '#8B5CF6',   // Viola - Pensare
          acting: '#F59E0B',     // Arancione - Agire
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
