/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        /* === Brand Tokens (Pro Max) === */
        brand: {
          DEFAULT: '#F5C518',
          hover: '#D4A017',
          dark: '#B8860B',
          ink: '#8A6100',
          'ink-hover': '#6B4700',
          glow: 'rgba(245, 197, 24, 0.15)',
        },
        /* === Surface Palette (60-30-10 rule) === */
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
          border: '#E2E8F0',
          dark: '#0F172A',
        },
        ink: {
          DEFAULT: '#1E293B',
          muted: '#64748B',
          faint: '#94A3B8',
        },
        /* Legacy aliases — keep for backward compat */
        'sunshine': '#F5C518',
        'sunshine-hover': '#D4A017',
        'sunshine-dark': '#B8860B',
        'amber-gold': '#D4A017',
        'gold': '#FFA500',
        'sunshine-ink': '#8A6100',
        'sunshine-ink-hover': '#6B4700',
        'sunshine-dark-hover': '#8A6100',
        'monday-violet': '#F5C518',
        'monday-violet-hover': '#D4A017',
        'slate-text': '#4A4D58',
        'iron': '#8A8E9C',
        'fog': '#C5C9D4',
        'mist': '#D8DCE6',
        'pebble': '#E3E6F0',
        'cloud': '#F4F5F7',
        'snow': '#FFFFFF',
        'shadow-dust': '#E2E5EC',
        /* Accents — Pastel */
        'mint': '#bcfe90',
        'sky-accent': '#abf0ff',
        'apricot': '#ff8940',
        'lavender': '#FFE9B8',
        'periwinkle': '#FFF6D1',
        'cornflower': '#FFD633',
        'aqua': '#d1faff',
        'cotton-candy': '#FFB84D',
        'ultra-violet': '#D4A017',
        'electric-cyan': '#3ac9ff',
        'forest': '#2a5c4e',
        'peony': '#fcd0f8',
        'periwinkle-wash': '#FFE9A3',
        'peach': '#ffe8d6',
        'prism': '#F5C518',
        /* shadcn/ui compat */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        brand: {
          DEFAULT: 'hsl(var(--brand, #F5C518))',
          hover: '#D4A017',
          dark: '#B8860B',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': 'calc(var(--radius) * 1.5)',
        '3xl': 'calc(var(--radius) * 2)',
        'pill': '160px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(50,51,56,0.08)',
        'card-hover': '0 8px 24px rgba(50,51,56,0.12)',
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'button-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'xl': '0 2px 8px rgba(50,51,56,0.08)',
        'xl-2': '0 8px 24px rgba(50,51,56,0.12)',
        'xl-3': 'rgba(0, 0, 0, 0.15) 0px 4px 40px 0px',
        'xl-4': 'rgba(0, 0, 0, 0.4) 0px 5px 55px 0px',
        'subtle': 'rgb(0, 0, 0) 0px -2px 0px 0px inset',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
        'marquee': 'marquee 30s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient-shift 3s ease infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-apricot': 'linear-gradient(90deg, rgb(254, 129, 228), rgb(254, 129, 228) 31%, rgb(253, 169, 0) 88%)',
        'gradient-prism': 'conic-gradient(from 270deg, rgb(129, 129, 255) 15%, rgb(51, 219, 219) 40%, rgb(51, 213, 142) 55%, rgb(255, 214, 51) 65%, rgb(252, 82, 125) 85%, rgb(129, 129, 255) 100%)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
