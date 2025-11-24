module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NeonOps Design System Colors
        neon: {
          blue: {
            core: '#FFFFFF',
            glow100: '#AEEFFF',
            glow300: '#00E5FF',
            glow500: '#00B8D4',
            glow700: '#008BA3',
          },
          green: {
            core: '#FFFFFF',
            glow100: '#C3F5D1',
            glow300: '#39FF14',
            glow500: '#37C856',
            glow700: '#20B042',
          },
          accent: {
            red: '#FF4500',
            redBorder: '#FF6B6B',
          },
        },
        dark: {
          primary: 'rgba(0, 20, 40, 0.8)',
          secondary: '#001528',
          tertiary: '#002a50',
          panel: 'rgba(0, 20, 40, 0.9)',
        },
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
        // Legacy colors for backward compatibility
        'blue-primary': '#00E5FF',
        'blue-light': '#AEEFFF',
        'emerald': '#39FF14',
        'emerald-dark': '#37C856',
        'cyan': '#00E5FF',
      },
      boxShadow: {
        'neon-blue-sm': '0 0 5px #00E5FF, 0 0 10px #00E5FF',
        'neon-blue-md': '0 0 10px #00E5FF, 0 0 20px #00E5FF, 0 0 30px rgba(0, 229, 255, 0.5)',
        'neon-blue-lg': '0 0 15px #00E5FF, 0 0 30px #00E5FF, 0 0 50px #00E5FF',
        'neon-green-md': '0 0 10px #39FF14, 0 0 20px #39FF14',
        'neon-inset-blue': 'inset 0 0 15px rgba(0, 229, 255, 0.6)',
      },
      dropShadow: {
        'neon-blue': '0 0 8px #00E5FF',
        'neon-green': '0 0 8px #39FF14',
      },
      backgroundImage: {
        'circuit-pattern': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23008BA3\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },
    },
  },
  plugins: [],
}

