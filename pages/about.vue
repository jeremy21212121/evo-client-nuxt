<template>
  <v-row>
    <v-col class="d-flex justify-center align-center">
      <v-card elevation="2" max-width="550px" :class="$vuetify.breakpoint.sm ? 'mt-4' : $vuetify.breakpoint.width > 1200 ? 'mt-10' : ''">
        <v-img :src="heroSrc" />
        <v-card-title>
          About Evo Finder
        </v-card-title>
        <v-card-subtitle class="text-left pb-2">
          Find available Evo Car Share vehicles in Vancouver, BC
        </v-card-subtitle>
        <v-divider class="mx4" />
        <v-card-text class="pa-2">
          Evo Finder is an unoffical web application which lets you find available cars from the comfort of your web browser.
        </v-card-text>
        <v-card-text class="pa-2">
          There used to be an official web interface, but it was recently discontinued. The official Android app makes use of tracking libraries from companies like Baidu and Facebook.
        </v-card-text>
        <v-card-text class="pa-2">
          This web application respects your privacy. There are no ads or user tracking. Your location is used only to list available vehicles, and even that is optional.
        </v-card-text>
        <v-divider class="mx4" />
        <!-- <v-card-text>
          This application is free and open-source
        </v-card-text> -->
        <v-list dense>
          <v-subheader class="text-uppercase">
            This application is free and open-source
          </v-subheader>
          <v-list-item href="https://github.com/jeremy21212121/evo-client-nuxt">
            <v-list-item-icon>
              <v-icon medium>
                {{ svgPath }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>View source code</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item href="https://github.com/jeremy21212121/evo-client-nuxt/issues">
            <v-list-item-icon>
              <v-icon medium>
                mdi-alert-circle-outline
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Report an issue</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mdiGithub } from '@mdi/js'
// import evoFinderSvg from '~/static/evofinder.svg?inline'
import heroImage from '~/assets/skyscrapers-958.jpg'
export default {
  name: 'About',
  components: {
    // evoFinderSvg
  },
  data () {
    return {
      svgPath: mdiGithub,
      heroSrc: heroImage
    }
  },
  head () {
    return {
      title: 'About'
    }
  }
}
</script>

<style>
/* h1.title {
  margin-top: 18px;
} */
svg.logo {
  width: 22%;
  max-width: 128px;
}
</style>
