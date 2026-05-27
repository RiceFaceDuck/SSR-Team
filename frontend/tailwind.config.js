/** @type {import('tailwindcss').Config} */
export default {
  // สั่งให้ Tailwind ไปอ่านคลาส CSS จากไฟล์ในโฟลเดอร์ src ทั้งหมด
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}