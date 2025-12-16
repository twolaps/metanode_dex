/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Consolas',
          'Microsoft YaHei',
          'PingFang SC', // macOS 中文
          'Hiragino Sans GB', // macOS 中文
          'Helvetica Neue', // macOS 英文
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
