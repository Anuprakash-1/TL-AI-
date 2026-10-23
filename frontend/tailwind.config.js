/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#15213b',
          700: '#1e2e4f',
          600: '#2c4068',
        },
        verdict: {
          verified: '#059669',
          verifiedBg: '#064e3b',
          false: '#dc2626',
          falseBg: '#7f1d1d',
          misleading: '#d97706',
          misleadingBg: '#78350f',
          partly: '#2563eb',
          partlyBg: '#1e3a8a',
          unverified: '#64748b',
          unverifiedBg: '#334155',
          outdated: '#9333ea',
          outdatedBg: '#581c87',
          disputed: '#ea580c',
          disputedBg: '#7c2d12',
          opinion: '#0891b2',
          opinionBg: '#164e63',
          satire: '#db2777',
          satireBg: '#831843'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
