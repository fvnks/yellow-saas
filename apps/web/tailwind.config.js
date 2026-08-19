/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: '#E6EFF5',
        input: '#E6EFF5',
        ring: '#1814F3',
        background: '#F5F7FA',
        foreground: '#232323',
        primary: {
          DEFAULT: '#1814F3',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#FFFFFF',
          foreground: '#232323'
        },
        destructive: {
          DEFAULT: '#FE5C73',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#F5F7FA',
          foreground: '#8BA3CB'
        },
        accent: {
          DEFAULT: '#F5F7FA',
          foreground: '#232323'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#232323'
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#232323'
        },
        sidebar: {
          DEFAULT: '#FFFFFF',
          foreground: '#718EBF',
          primary: '#1814F3',
          'primary-foreground': '#FFFFFF',
          accent: '#F5F7FA',
          'accent-foreground': '#232323',
          border: '#E6EFF5',
          ring: '#1814F3'
        },
        brand: {
          blue: '#1814F3',
          'blue-bright': '#2D60FF',
          teal: '#16DBCC',
          red: '#FE5C73',
          amber: '#FFBB38',
          yellow: '#FFBB38',
        }
      },
      borderRadius: {
        lg: '1rem', // rounded-2xl maps to 'xl' or '2xl', let's use tailwind standard but make our base 'lg' large
        md: '0.75rem',
        sm: '0.5rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.06)',
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'button-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.15s ease-out',
        'accordion-down': 'accordion-down 0.15s ease-out',
        'accordion-up': 'accordion-up 0.15s ease-out',
        'collapsible-down': 'collapsible-down 0.15s ease-out',
        'collapsible-up': 'collapsible-up 0.15s ease-out',
        'marquee': 'marquee 30s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient-shift 3s ease infinite',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'collapsible-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-collapsible-content-height)', opacity: '1' }
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' }
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(37, 99, 235, 0.2)' }
        },
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};
