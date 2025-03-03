// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  runtimeConfig: {
    bese_url: 'https://aihubmix.com/v1',
    api_key: 'sk-BCRfnMLZBnKwjIV6013bCbAbC7184c829d9959344237E93e',
  },
})
