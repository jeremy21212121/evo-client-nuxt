// import { NuxtConfig } from '@nuxt/types'
import colors from 'vuetify/es5/util/colors'
require('dotenv').config()

const config = {
  ssr: false,
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    titleTemplate: '%s - Evo Finder',
    title: 'Find A Car',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, minimal-ui' },
      { hid: 'description', name: 'description', content: 'Find available Evo Car Share vehicles near you' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  pwa: {
    meta: {
      name: 'Evo Finder',
      mobileAppIOS: true,
      author: 'Jeremy P',
      description: 'Find available Evo Car Share vehicles near you',
      theme_color: '#323232',
      ogSiteName: 'Evo Finder',
      ogTitle: 'Evo Finder',
      ogDescription: 'Find available Evo Car Share vehicles near you',
      ogHost: 'https://evofinder.ca',
      ogImage: '/ef-social-1200x630.jpg',
      nativeUI: true
    },
    manifest: {
      name: 'Evo Finder',
      short_name: 'Evo Finder',
      background_color: '#323232'
    }
  },
  publicRuntimeConfig: {
    identityBaseUrl: process.env.IDENTITY_BASE_URL,
    anonymousClientId: process.env.ANONYMOUS_CLIENT_ID,
    anonymousClientSecret: process.env.ANONYMOUS_CLIENT_SECRET,
    anonymousBaseUrl: process.env.ANONYMOUS_BASE_URL,
    anonymousApiKey: process.env.ANONYMOUS_API_KEY,
    secureClientId: process.env.SECURE_CLIENT_ID,
    secureClientSecret: process.env.SECURE_CLIENT_SECRET,
    secureBaseUrl: process.env.SECURE_BASE_URL,
    secureApiKey: process.env.SECURE_API_KEY,
    userAgent: process.env.USER_AGENT,
    mapBoxKey: process.env.MAPBOX_KEY,
    mapTilerKey: process.env.MAPTILER_KEY
  },
  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    '~/static/mapbox-gl.css'
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '~/plugins/anonApiData.ts'
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/dotenv',
    '@nuxtjs/svg'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://github.com/skyatura/vue-geolocation-api
    'vue-geolocation-api/nuxt'
  ],
  geolocation: {
    watch: true
  },
  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  }
}

export default config
