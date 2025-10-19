// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,

  typescript: {
    typeCheck: true,
    strict: true,
  },

  runtimeConfig: {
    apiUrl: process.env.API_BASE_URL! || "",
  },
});
