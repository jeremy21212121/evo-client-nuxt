/**
 * No longer functional or necessary.
 * NB: AnonApi.Data constructor now takes a config object
 *

import { Plugin } from '@nuxt/types'
import { AnonApi } from './AnonApi/index'

// Create the instance to be used by the plugin
const anonApiData = new AnonApi.Data()
// function to be injected
const getAllAnonApiData = anonApiData.getAll

// Boilerplate adapted from https://typescript.nuxtjs.org/cookbook/plugins/#plugin-2
declare module 'vue/types/vue' {
  // this.$myInjectedFunction inside Vue components
  interface Vue {
    $getAllAnonApiData: typeof getAllAnonApiData
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$myInjectedFunction inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $getAllAnonApiData: typeof getAllAnonApiData
  }
  // nuxtContext.$myInjectedFunction
  interface Context {
    $getAllAnonApiData: typeof getAllAnonApiData
  }
}

declare module 'vuex/types/index' {
  // this.$myInjectedFunction inside Vuex stores
  interface Store<S> {
    $getAllAnonApiData: typeof getAllAnonApiData
  }
}

const myPlugin: Plugin = (_context, inject) => {
  inject('getAllAnonApiData', getAllAnonApiData)
}

export default myPlugin

*/
