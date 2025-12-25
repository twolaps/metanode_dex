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
        // 无衬线字体：用于大部分 UI 文本
        sans: [
					'Inter',               // 现代 Web 字体（可选，需通过 Next.js Font 引入）
          '-apple-system',       // iOS/macOS Safari 的系统字体
          'BlinkMacSystemFont',  // macOS Chrome 的系统字体
          'PingFang SC',         // iOS/macOS 的首选中文
          'Hiragino Sans GB',    // macOS 旧版中文
          'Roboto',              // Android 系统的默认英文/数字字体
          '"Noto Sans CJK SC"',  // Android 系统常见的中文字体
          '"Microsoft YaHei"',   // Windows 的首选中文
          'Helvetica Neue',      // 经典的 iOS/macOS 英文
          'Arial',               // 通用无衬线
          'sans-serif',          // 浏览器最后的兜底
        ],
        // 等宽字体：用于显示价格、哈希值、代码
        mono: [
          'Consolas', 
          'Monaco', 
          'monospace'
        ],
      },
			colors:{
				bg: 'var(--background)',
			},
			boxShadow: {
				// 定义名为 'glow' 的变量
				'glow': '0 0 25px rgba(37,99,235,1)',
			}
    },

  },
  plugins: [],
	darkMode: 'class',
};
