/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:       '#EE7623',
        primaryDk:     '#C85A0A',
        danger:        '#C33C32',
        dangerLt:      '#F0483E',
        warning:       '#FAA21B',
        yellow:        '#FDDA00',
        slate:         '#5F6B6D',
        slateLight:    '#C8C8C8',
        offwhite:      '#F7F6F2',
        'tp-border':   '#E5E3DC',
        success:       '#2E7D52',
        successLt:     '#E8F5EE',
        info:          '#1A6FA8',
        infoLt:        '#E3F0FA',
        textPrimary:   '#1A1A1A',
        textSecondary: '#5F6B6D',
        textTertiary:  '#9A9A9A',
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
