import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        // Cream surface system (light mode)
        surf: {
          base: '#F6F2EA',
          DEFAULT: '#FFFFFF',
          high: '#FAF8F3',
          input: '#F0EBE0',
        },
        // Navy + gold palette
        brand: {
          100: '#18150F',  // primary ink text
          200: '#3A3628',  // secondary ink text
          300: '#C8A84B',  // gold accent
          400: '#8C8270',  // muted text
          500: '#2A4080',  // navy light
          600: '#0D1B3E',  // navy primary (buttons, CTA)
          700: '#1A2D5A',  // navy hover
          800: '#E8EBF4',  // very light navy tint (bg)
          900: '#F0F2F8',  // lightest navy tint
        },
        // Borders
        rim: {
          DEFAULT: '#E0D8C8',
          subtle: '#CFC6B0',
        },
        // Muted text
        muted: '#8C8270',
        // Risk colors (dark on light bg)
        risk: {
          low: '#1E7A50',
          medium: '#C47A18',
          high: '#B83232',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
