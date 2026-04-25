import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slatepanel: '#0f172a',
        shellbg: '#f1f5f9',
      },
      boxShadow: {
        shell: '0 8px 24px rgba(2, 6, 23, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
