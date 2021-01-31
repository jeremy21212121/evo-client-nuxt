<template>
  <v-snackbar v-if="vehicle" v-bind="snackbar" class="modified">
    <div class="car-wrapper">
      <div class="close">
        <v-btn :icon="true" @click="$emit('close')">
          <v-icon color="black">
            mdi-close
          </v-icon>
        </v-btn>
      </div>
      <div class="car-column">
        <v-list dense color="rgba(255,255,255,0.0">
          <v-subheader light>
            {{ plate }}
          </v-subheader>
          <!-- distance from user -->
          <v-list-item v-if="vehicle.distance" light>
            <v-list-item-icon>
              <v-icon medium color="rgba(0,0,0,0.9)">
                {{ icons.distance }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ distanceString(vehicle.distance) }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!-- fuel level -->
          <v-list-item light>
            <v-list-item-icon>
              <v-icon medium color="rgba(0,0,0,0.9)">
                {{ icons.fuel }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ `${fuel} %` }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
      <div class="car-column">
        <picture>
          <source :srcset="images[model].webp">
          <img :src="images[model].png" :alt="`Toyota ${model}`">
        </picture>
      </div>
    </div>
  </v-snackbar>
</template>

<script>
import { mdiMapMarkerDistance } from '@mdi/js'
import priusPng from '~/assets/prius.png'
import priusWebp from '~/assets/prius.webp'
import priusCPng from '~/assets/prius_c.png'
import priusCWebp from '~/assets/prius_c.webp'
export default {
  name: 'VehicleDetails',
  props: {
    vehicle: {
      type: Object,
      required: true
    },
    userLocation: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      icons: {
        distance: mdiMapMarkerDistance,
        fuel: 'mdi-gas-station'
      },
      images: {
        Prius: {
          png: priusPng,
          webp: priusWebp
        },
        'Prius C': {
          png: priusCPng,
          webp: priusCWebp
        }
      },
      snackbar: {
        app: true,
        timeout: -1,
        value: true,
        centered: true,
        bottom: true,
        color: '#00BCE2',
        maxWidth: 500,
        width: '100%',
        elevation: 14
      }
    }
  },
  computed: {
    model () {
      return this.vehicle.description.model
    },
    plate () {
      return this.vehicle.description.plate
    },
    fuel () {
      return this.vehicle.status.energyLevel
    },
    hasUserLocation () {
      return Array.isArray(this.userLocation) && this.userLocation.length === 2
    }
  },
  methods: {
    distanceString (distance) {
      let output = `${distance} m`
      if (this.distance > 999) {
        // Kilometers to 2 decimal places. Example: 1.23
        const km = Math.round(distance / 10) / 100
        output = `${km} km`
      }
      return output
    }
  }
}
</script>

<style lang="scss">
// We are abusing a vuetify component here so we need to override styles
div.v-snack.modified {
  flex-direction: column;
  justify-content: flex-end;
  div.v-snack__wrapper {
    display: flex;
    justify-content: center;
    margin: 0;
    height: 140px;
    // simple fix for being too wide on desktop/laptop screens
    max-width: 330px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    background: linear-gradient(90deg, rgba(0,172,226,1) 0%, rgba(0,188,226,1) 100%);
    div.v-snack__content {
      width: 100%;
      height: 100%;
      padding: 4px 6px;
      padding: 0;
      margin: 0;
      // We have a mystery 8px margin on the right. Not an actual margin, but 8px that refuse to be filled.
      // Strangely, it is consistent across FF/chromium. Added a 8px margin-left so we match.
      margin-left: 8px;
      .car-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: wrap;
        .close {
          width: 100%;
          height: 0px;
          display: flex;
          justify-content: flex-end;
        }
        .car-column {
          width: 50%;
          .v-subheader {
            font-weight: bold;
            color:  rgba(0,0,0,0.9);
            font-size: 1.125rem;
            padding-left: 24px;
          }
          div.v-list-item__title {
            color: rgba(0,0,0,1);
            font-size: 0.875rem;
          }
          .car-row {
            display: flex;
            flex-wrap: wrap;
          }
          img {
            margin-top: 38px;
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
