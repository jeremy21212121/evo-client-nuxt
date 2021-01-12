<template>
  <section>
    <client-only>
      <MglMap
        :access-token="$config.mapBoxKey"
        :map-style="mapConfig.style"
        :center="mapConfig.center"
        :zoom="mapConfig.zoom"
        @load="onMapLoaded"
      >
        <MglMarker
          v-if="locationReady"
          :coordinates="location"
        >
          <UserMarkerIcon slot="marker" />
          <MglPopup slot="default" v-bind="mapConfig.markers.user.popup">
            Your location
          </MglPopup>
        </MglMarker>
        <div v-if="vehicleDataReady">
          <MglMarker
            v-for="(vehicle, vehicleIndex) in vehicles"
            :key="`v-marker-${vehicleIndex}`"
            :coordinates="extractCoords(vehicle)"
            color="black"
          />
        </div>
      </MglMap>
    </client-only>
    <aside>
      <span v-show="$fetchState.loading">
        Loading...
      </span>
    </aside>
  </section>
</template>

<script lang="js">
// Using JS because there are no types for mapbox-gl or vue-mapbox
import Mapbox from 'mapbox-gl'
import { MglMap, MglMarker, MglPopup } from 'vue-mapbox'
import UserMarkerIcon from '~/components/UserMarkerIcon.vue'

export default {
  components: {
    MglMap,
    MglMarker,
    UserMarkerIcon,
    MglPopup
  },
  async fetch () {
    // Set to defaults if there is a timeout or error
    const latLonArray = await this.getCoordsAsync(10)
    // Semicolon line-ending required due to parsing ambiguity
    this.mapConfig.center = latLonArray.reverse();
    // assign all the data from the anon API responses
    [this.models, this.options, this.parking, this.homezones, this.cities, this.vehicles] = await this.$getAllAnonApiData(latLonArray)
  },
  fetchOnServer: false,
  data () {
    return {
      mapLoaded: false,
      mapbox: null,
      mapConfig: {
        style: `https://api.maptiler.com/maps/streets/style.json?key=${this.$config.mapTilerKey}`,
        // mapbox-gl uses [lon,lat] (like GeoJSON) instead of the convential [lat,long]
        defaultCenter: [-123.1205741140304, 49.283342879699745],
        center: [-123.1205741140304, 49.283342879699745],
        zoom: 10,
        markers: {
          user: {
            popup: {
              onlyText: true,
              closeButton: false,
              closeOnClick: true
            }
          }
        }
      },
      models: [],
      options: [],
      parking: [],
      homezones: [],
      cities: [],
      vehicles: []
    }
  },
  computed: {
    // @returns {boolean}
    locationReady () {
      return !this.$geolocation.loading && this.$geolocation.supported && this.$geolocation.coords !== null
    },
    // @returns {[number,number] | null}
    location () {
      const coords = this.$geolocation.coords
      return coords ? [coords.longitude, coords.latitude] : this.mapConfig.defaultCenter
    },
    // @returns {[number,number]}
    center () {
      return (this.locationReady && this.location) ? this.location : this.mapConfig.defaultCenter
    },
    // @returns {boolean}
    vehicleDataReady () {
      return !this.$fetchState.pending && !this.$fetchState.error && this.vehicles.length > 0
    }
  },
  created () {
    this.mapbox = Mapbox
  },
  methods: {
    /**
     * @param {AvailableVehicle} availableVehicle
     * @returns {[number,number]} - in [lon,lat] format
     */
    extractCoords (availableVehicle) {
      const { lon, lat } = availableVehicle.location.position
      return [lon, lat]
    },

    /**
     * Waits for location for up to 'sec' seconds, resolves to default location if timeout is exceeded.
     * @returns {Promise<[number, number]>} - in [lat,lon] format for /avaialableVehicles API call
     */
    async getCoordsAsync (sec = 10) {
      const options = { timeout: sec * 1000, maximumAge: 24 * 3600 * 1000 }

      const position = await this.$geolocation
        .getCurrentPosition(options)
        .catch(_e => null)

      // set to default position in [lat,lon] format
      let output = this.mapConfig.defaultCenter.reverse()

      if (position && position.coords) {
        output = [position.coords.latitude, position.coords.longitude]
      }
      return output
    },
    onMapLoaded (_event) {
      this.mapLoaded = true
    }
  }
}
</script>

<style scoped>
section {
  width: 100%;
  /* min-height: 50vh; */
  height: calc(100vh - 56px);
}
@media screen and (min-width: 950px) {
  section {
    height: calc(100vh - 64px);
  }
}
</style>
