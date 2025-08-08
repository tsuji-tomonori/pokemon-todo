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
        pokemon: {
          normal: '#A8A878',
          fire: '#F08030',
          water: '#6890F0',
          electric: '#F8D030',
          grass: '#78C850',
          ice: '#98D8D8',
          fighting: '#C03028',
          poison: '#A040A0',
          ground: '#E0C068',
          flying: '#A890F0',
          psychic: '#F85888',
          bug: '#A8B820',
          rock: '#B8A038',
          ghost: '#705898',
          dragon: '#7038F8',
          dark: '#705848',
          steel: '#B8B8D0',
          fairy: '#EE99AC',
        }
      },
      fontFamily: {
        pixel: ['DotGothic16', 'monospace'],
        sans: ['Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      boxShadow: {
        'neo-light': '-8px -8px 16px #FFFFFF, 8px 8px 16px #D1D5DB',
        'neo-dark': '-8px -8px 16px #2A2D35, 8px 8px 16px #0A0B0F',
        'neo-light-inset': 'inset -8px -8px 16px #FFFFFF, inset 8px 8px 16px #D1D5DB',
        'neo-dark-inset': 'inset -8px -8px 16px #2A2D35, inset 8px 8px 16px #0A0B0F',
      }
    },
  },
  plugins: [],
}