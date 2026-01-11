/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize:{
        'course-details-heading-small':['26px','34px'],
        'course-details-heading-large':['36px','44px'],
        'home-heading-small':['28px','36px'],
        'home-heading-large':['48px','56px'],
         'default':['16px','24px'],
      },
      spacing:{
        'section-height':'500px',
      },
      maxWidth:{
        'course-card':'424px',
      },
      boxShadow:{
        'custome-card':'0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
