import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0B',
        coal: '#141416',
        graphite: '#1C1C1F',
        gold: { DEFAULT: '#D6BC8A', light: '#EBDCB6', dark: '#A8884F' },
        silver: '#C7CAD1',
        bone: '#EDE7DA',
        mute: '#8D8981',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        cinzel: ['var(--font-cinzel)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 12px 36px -14px rgba(214,188,138,.45)',
        deep: '0 30px 80px -30px rgba(0,0,0,.95)',
      },
    },
  },
  plugins: [],
}
export default config
