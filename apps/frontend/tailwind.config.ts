import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['"PT Sans"', 'sans-serif'],
        headline: ['"PT Sans"', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        // Makikibahay dark theme colors
        background: '#2d2d2d', // rgb(45,45,45)
        surface: '#32393d', // rgb(50,57,61)
        'surface-hover': '#373737', // rgb(55,55,55)
        border: '#464646', // rgb(70,70,70)
        'primary-text': '#bdbdbd', // rgb(189,189,189)
        accent: '#a9714b', // rgb(169,113,75)
        
        // Aliases for existing shadcn components
        foreground: '#bdbdbd',
        card: '#32393d',
        'card-foreground': '#bdbdbd',
        popover: '#373737',
        'popover-foreground': '#bdbdbd',
        primary: '#a9714b',
        'primary-foreground': '#2d2d2d',
        secondary: '#464646',
        'secondary-foreground': '#bdbdbd',
        muted: '#32393d',
        'muted-foreground': '#757575',
        destructive: '#ef4444',
        'destructive-foreground': '#2d2d2d',
        input: '#373737',
        ring: '#a9714b',
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
