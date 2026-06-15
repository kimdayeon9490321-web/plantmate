import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3fbf7',
          100: '#daf3e7',
          200: '#b9e6cc',
          300: '#8fd8ac',
          400: '#61c788',
          500: '#3aa662',
          600: '#2d8550',
          700: '#266c42',
          800: '#235a38',
          900: '#214f31'
        }
      }
    }
  },
  plugins: []
};

export default config;
