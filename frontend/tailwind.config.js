/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        streak: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          flame: '#ea580c',
        },
        exam: {
          light: '#ede9fe',
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
        button: '0 4px 0 0 rgba(0, 0, 0, 0.15)',
        'button-brand': '0 4px 0 0 #047857',
        'button-streak': '0 4px 0 0 #b45309',
        'button-exam': '0 4px 0 0 #4338ca',
      },
    },
  },
  plugins: [],
};
