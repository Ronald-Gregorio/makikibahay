import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Roboto', 'sans-serif'],
        headline: ['Roboto', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        // Apartments-clone light theme
        background: '#ffffff',
        foreground: '#333333',
        card: '#ffffff',
        'card-foreground': '#333333',
        popover: '#ffffff',
        'popover-foreground': '#333333',
        primary: '#218d3d',
        'primary-foreground': '#ffffff',
        secondary: '#f4f4f4',
        'secondary-foreground': '#666666',
        muted: '#f4f4f4',
        'muted-foreground': '#666666',
        accent: '#218d3d',
        'accent-foreground': '#ffffff',
        destructive: '#ff385c',
        'destructive-foreground': '#ffffff',
        border: '#dddddd',
        input: '#dddddd',
        ring: '#218d3d',
        // Extended design tokens
        'primary-green': '#218d3d',
        'primary-green-hover': '#1e7a3b',
        'dark-green': '#11421f',
        'text-dark': '#333333',
        'text-light': '#ffffff',
        'gray-light': '#f4f4f4',
        'gray-border': '#dddddd',
        'gray-text': '#666666',
        'blue-primary': '#0077ff',
        'orange-primary': '#ff8800',
        'red-alert': '#ff385c',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
