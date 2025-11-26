module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        theme: {
          'bg-primary': 'var(--color-bg-primary)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-surface': 'var(--color-bg-surface)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-subtle': 'var(--color-text-subtle)',
          'border': 'var(--color-border)',
          'accent-primary': 'var(--color-accent-primary)',
          'accent-secondary': 'var(--color-accent-secondary)',
          'card-bg': 'var(--card-bg)',
          'card-border': 'var(--card-border)',
          'input-bg': 'var(--input-bg)',
          'badge-bg': 'var(--badge-bg)',
          'badge-text': 'var(--badge-text)',
        },
        dark: {
          primary: '#020617',
          secondary: '#0F172A',
          tertiary: '#1E293B',
          panel: 'rgba(15, 23, 42, 0.95)',
        },
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'elevated': 'var(--shadow-elevated)',
        'sm-theme': 'var(--shadow-sm)',
      },
      backgroundImage: {
      },
    },
  },
  plugins: [],
}
