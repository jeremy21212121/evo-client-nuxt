<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon class="mr-3" @click.stop="drawer = !drawer" />
      <evo-finder-svg class="svg-logo mr-3" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-format-list-bulleted</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <div class="nopad-container">
        <nuxt />
      </div>
    </v-main>
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item ripple>
          <v-list-item-icon>
            <v-icon>
              mdi-map-marker-question-outline
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>Coming soon...</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
import { mdiCarConnected } from '@mdi/js'
import EvoFinderSvg from '~/static/evofinder.svg?inline'
export default {
  name: 'DefaultLayout',
  components: {
    EvoFinderSvg
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: mdiCarConnected,
          title: 'Find A Car',
          to: '/'
        },
        {
          icon: 'mdi-information-outline',
          title: 'About',
          to: '/about'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Evo Finder'
    }
  }
}
</script>

<style>
.nopad-container {
  padding: 0;
}
div.mapboxgl-popup-content {
  color: rgba(0,0,0,0.8);
}
svg.svg-logo {
  width: 32px;
  height: 32px;
}
div.v-application--wrap {
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}
</style>
