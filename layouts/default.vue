<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-subheader>
        {{ `v${$config.appVersion}` }}
      </v-subheader>
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
      <v-subheader>
        Nearby Vehicles
      </v-subheader>
      <v-list v-if="nearestVehicles.length > 0">
        <v-list-item
          v-for="(car, carIndex) in nearestVehicles"
          :key="`nearby-${carIndex}`"
          :class="'modified'"
          ripple
          dense
        >
          <v-list-item-title>{{ car.description.plate }}</v-list-item-title>
          <v-list-item-icon v-if="car.distance">
            <v-icon dense>
              {{ icons.distance }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-subtitle v-if="car.distance" title="Distance">
            {{ distanceString(car.distance) }}
          </v-list-item-subtitle>
          <v-list-item-icon>
            <v-icon>
              mdi-gas-station
            </v-icon>
          </v-list-item-icon>
          <v-list-item-subtitle title="Fuel level">
            {{ `${car.status.energyLevel} %` }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import { mdiCarConnected, mdiMapMarkerDistance } from '@mdi/js'
import EvoFinderSvg from '~/static/evofinder.svg?inline'

export default {
  name: 'DefaultLayout',
  components: {
    EvoFinderSvg
  },
  data () {
    return {
      icons: {
        distance: mdiMapMarkerDistance
      },
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
  },
  computed: {
    ...mapState(['position']),
    ...mapGetters(['nearestVehicles'])
  },
  watch: {
    '$geolocation.coords' (obj) {
      if ((obj.latitude !== this.position.lat) || (obj.longitude !== this.position.lon)) {
        this.setPosition({ lat: obj.latitude, lon: obj.longitude })
      }
    }
  },
  methods: {
    ...mapActions(['setPosition']),
    distanceString (distance) {
      let output = `${distance} m`
      if (distance > 999) {
        // Kilometers to 2 decimal places. Example: 1.23
        const km = Math.round(distance / 10) / 100
        output = `${km} km`
      }
      return output
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
div.v-list-item.modified {
  flex-wrap: wrap;
  margin: 4px 0px;
}
div.v-list-item.modified div.v-list-item__icon {
  max-width: 20%;
  margin-right: 2%;
}
div.v-list-item.modified div.v-list-item__subtitle {
  max-width: 25%;
  margin-right: 2%;
}
@media screen and (min-width: 700px) {
  div.v-list-item.modified {
    margin: 8px 0px;
  }
}
</style>
