module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ghost: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          900: '#1a1a1a'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
