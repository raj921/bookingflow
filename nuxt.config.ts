import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-07-07',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  runtimeConfig: {
    ticketeApiKey: process.env.TICKETE_API_KEY,
    ticketeBaseUrl: process.env.TICKETE_BASE_URL || 'https://knot.tickete.co'
  },
  vite: {
    optimizeDeps: {
      include: ['@lucide/vue', 'gsap', 'gsap/ScrollTrigger']
    },
    plugins: [tailwindcss()]
  }
})
