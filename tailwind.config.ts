import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Keep preflight false during gradual migration so unmigrated pages remain 100% untouched
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#e5345b',
          hover: '#cf274c',
          light: '#fff1f4',
          soft: '#fdf5f6',
          border: '#f8c2cb',
          subtle: '#fee1e8',
        },
        page: '#faf8f9',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        brand: ['"Kaisei Tokumin"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display': ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '1.25', fontWeight: '700' }],
        'brand': ['1.625rem', { lineHeight: '1.25', fontWeight: '400' }],
        'section': ['2rem', { lineHeight: '1.25', fontWeight: '500' }],
        'subheading': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.65', fontWeight: '400' }],
        'emphasis': ['1.125rem', { lineHeight: '1.5', fontWeight: '700' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        'meta': ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }],
        'badge': ['0.625rem', { lineHeight: '1', fontWeight: '700' }],
      },
      borderRadius: {
        'pill': '25px',
        'card': '12px',
      },
    },
  },
  plugins: [],
};

export default config;

