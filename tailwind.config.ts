import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      black: '#000000',
      white: '#ffffff',
      red: {
        DEFAULT: '#ff0000',
        400: '#ff3333',
        500: '#ff0000',
        600: '#cc0000',
      },
      green: {
        DEFAULT: '#00ff66',
        500: '#00ff66',
      },
      yellow: {
        DEFAULT: '#ffcc00',
        500: '#ffcc00',
      },
      gray: {
        900: '#111111',
        800: '#222222',
        700: '#333333',
        500: '#666666',
        400: '#999999',
      },
      transparent: 'transparent',
      current: 'currentColor',
    },
    fontFamily: {
      mono: [
        '"JetBrains Mono"',
        'ui-monospace',
        'SFMono-Regular',
        '"SF Mono"',
        'Menlo',
        'Consolas',
        '"Liberation Mono"',
        'monospace',
      ],
    },
    borderRadius: {
      none: '0px',
      DEFAULT: '0px',
      sm: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
    extend: {
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      keyframes: {
        'overlay-enter': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'overlay-exit': {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
        },
        'glyph-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'dot-pulse': {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'border-trace': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
      },
      animation: {
        'overlay-enter': 'overlay-enter 200ms ease-out',
        'overlay-exit': 'overlay-exit 150ms ease-in',
        'glyph-flicker': 'glyph-flicker 3s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'dot-pulse': 'dot-pulse 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 300ms ease-out',
        'slide-down': 'slide-down 300ms ease-out',
        'border-trace': 'border-trace 2s linear infinite',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #333333 1px, transparent 1px)',
        'grid-lines': 'linear-gradient(#222222 1px, transparent 1px), linear-gradient(90deg, #222222 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
        'grid-lines': '24px 24px',
      },
    },
  },
  plugins: [],
};

export default config;
