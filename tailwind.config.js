/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          bg: '#080810',
          surface: '#0f0f1a',
          card: '#161625',
          border: '#1e1e35',
        },
        accent: {
          indigo: '#6366f1',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
          light: '#818cf8',   // indigo for text on dark backgrounds (AA contrast)
        },
        ink: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#8795ab',
          faint: '#7b8aa3',
        },
        primary: {
          purple: '#6366f1',
          pink: '#ec4899',
          blue: '#3b82f6',
          orange: '#f97316',
          green: '#10b981',
        },
      },
      fontFamily: {
        'grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-purple-pink': 'linear-gradient(135deg, #6366f1, #ec4899)',
        'gradient-orange-pink': 'linear-gradient(135deg, #f97316, #ec4899)',
        'gradient-blue-purple': 'linear-gradient(135deg, #3b82f6, #6366f1)',
        'gradient-orange-yellow': 'linear-gradient(135deg, #f97316, #fbbf24)',
        'gradient-pink-orange': 'linear-gradient(135deg, #ec4899, #f97316)',
        'gradient-obsidian': 'linear-gradient(135deg, #6366f1, #22d3ee)',
        'gradient-hero': 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(34,211,238,0.08) 0%, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'progress-fill': 'progressFill 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.2)' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(99,102,241,0.4)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.4)',
        'glow-card': '0 0 0 1px rgba(99,102,241,0.3), 0 8px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
