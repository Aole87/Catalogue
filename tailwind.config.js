/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        carbon: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        fitment: {
          compatible: '#059669',
          'compatible-bg': '#ecfdf5',
          'compatible-border': '#a7f3d0',
          incompatible: '#dc2626',
          'incompatible-bg': '#fef2f2',
          'incompatible-border': '#fecaca',
          warning: '#d97706',
          'warning-bg': '#fffbeb',
          'warning-border': '#fde68a',
        },
        primary: "#2563eb",
        secondary: "#0f172a",
        success: "#059669",
        info: "#0284c7",
        dark: "#0f172a",
        light: "#f8fafc",
        danger: "#dc2626",
        warning: "#d97706",
      },
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        'elevated': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
