import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 2008 Web 2.0 palette
        'header-start': '#5c8bc7',
        'header-end': '#3b5998',
        'page-bg': '#edeff4',
        'panel-border': '#d8dfea',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'link': '#3b5998',
        'button-start': '#627aad',
        'button-end': '#4f6aa3',
        'button-border': '#29447e',
      },
      fontFamily: {
        'web-2-0': ['"Lucida Grande"', 'Tahoma', 'Verdana', 'sans-serif'],
      },
      borderRadius: {
        '2008': '3px',
      },
    },
  },
  plugins: [],
};
export default config;
