import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fffaf0',
          100: '#f8edcc',
          200: '#f0de9c',
          300: '#e8ce6f',
          400: '#dfbe4f',
          500: '#d4ad38',
          600: '#be9830',
          700: '#9c7b26',
          800: '#7a5f1d',
          900: '#574215',
        },
        blue: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        green: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        },
        red: {
          50: '#fffef0',
          100: '#fff9c2',
          200: '#fff38a',
          300: '#ffef54',
          400: '#ffeb1f',
          500: '#ffe600',
          600: '#f8d600',
          700: '#7d6a00',
          800: '#5f5000',
          900: '#413700',
        },
      },
    },
  },
  plugins: [],
}
export default config
