// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',
  serverDir: './server',
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    rootAttrs: {
      id: '__omnix',
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
    '@nuxt/icon',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@formkit/auto-animate/nuxt',
  ],
  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: 'first' }],
  },
  typescript: {
    typeCheck: true,
    strict: true,
  },
  nitro: {
    prerender: {
      routes: ['/', '/login', '/register'],
    },
  },
  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },
  ssr: false,
})
