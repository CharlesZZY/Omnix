// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    rootAttrs: {
      id: '__omnix',
    },
  },
  runtimeConfig: {
    bese_url: 'https://aihubmix.com/v1',
    api_key: 'sk-BCRfnMLZBnKwjIV6013bCbAbC7184c829d9959344237E93e',
  },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils', '@nuxt/icon', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],
  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: 'first' }],
  },
  typescript: {
    typeCheck: true,
    strict: true,
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },
})
