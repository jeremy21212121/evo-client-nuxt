<template>
  <section>
    <client-only>
      <MglMap
        ref="mapElement"
        :access-token="$config.mapBoxKey"
        :map-style="mapConfig.style"
        :center.sync="mapConfig.center"
        :zoom="mapConfig.zoom"
        @load="onMapLoad"
        @move="onMapMove"
        @moveend="onMapMoveEnd"
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
            v-for="(vehicle, vehicleIndex) in filteredVehicles"
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

// Temporarily load cached anon api data during dev to decrease load time
import Models from '~/assets/models.json'
import Options from '~/assets/options.json'
import Parking from '~/assets/parking.json'
import Homezones from '~/assets/homezones.json'
import Cities from '~/assets/cities.json'
import Vehicles from '~/assets/vehicles.json'

export default {
  name: 'MainMap',
  components: {
    MglMap,
    MglMarker,
    UserMarkerIcon,
    MglPopup
  },
  async fetch () {
    // Temporarily disable API calls to reduce load time in dev

    // Set to defaults if there is a timeout or error
    // const latLonArray = await this.getCoordsAsync(10)
    // assign all the data from the anon API responses
    // [this.models, this.options, this.parking, this.homezones, this.cities, this.vehicles] = await this.$getAllAnonApiData(latLonArray)
  },
  fetchOnServer: false,
  data () {
    return {
      mapLoaded: false,
      mapbox: null,
      mapState: {
        bounds: null,
        lastMove: 0
      },
      mapConfig: {
        style: `https://api.maptiler.com/maps/streets/style.json?key=${this.$config.mapTilerKey}`,
        // mapbox-gl uses [lon,lat] (like GeoJSON) instead of the convential [lat,long]
        defaultCenter: [-123.1205741140304, 49.283342879699745],
        center: [-123.1205741140304, 49.283342879699745],
        zoom: 16,
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
      models: Models,
      options: Options,
      parking: Parking,
      homezones: Homezones,
      cities: Cities,
      vehicles: Vehicles
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
    },
    filteredVehicles () {
      // filter vehicles not currently visible to avoid having to render 1500-2000 markers at once
      const output = []
      if (this.mapState.bounds !== null) {
        output.push(...this.vehicles.filter(car => this.inBounds(car, this.mapState.bounds)))
      }
      return output
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
      let output = Array.from(this.mapConfig.defaultCenter).reverse()

      if (position && position.coords) {
        output = [position.coords.latitude, position.coords.longitude]
      }
      return output
    },
    onMapLoad (_event) {
      this.mapLoaded = true
      this.mapState.bounds = this.$refs.mapElement.map.getBounds()
      this.$nextTick(() => {
        this.$refs.mapElement.map.flyTo({ center: this.location, essential: true })
      })
    },
    onMapMove (_event) {
      // const debounce = Date.now() - this.mapState.lastMove
      // console.log(_event.map._moving)
      if (!_event.map._moving) {
        // console.log(_event)
        this.mapState.bounds = this.$refs.mapElement.map.getBounds()
        this.mapState.lastMove = Date.now()
      }
    },
    onMapMoveEnd (_event) {
      const debounce = Date.now() - this.mapState.lastMove
      if (debounce > 70) {
        this.mapState.bounds = this.$refs.mapElement.map.getBounds()
        this.mapState.lastMove = Date.now()
      }
    },
    /**
     * @param {AvailableVehicle} vehicle
     * @param {Object} bounds
     * @param {LngLatLike} bounds._ne
     * @param {LngLatLike} bounds._sw
     * @returns {boolean}
     */
    inBounds (vehicle, bounds) {
      const lonLat = [vehicle.location.position.lon, vehicle.location.position.lat]
      const ne = [bounds._ne.lng, bounds._ne.lat]
      const sw = [bounds._sw.lng, bounds._sw.lat]
      // LT or == North/East Bounds  &&  GT or == South/West bounds
      return lonLat.every((n, i) => n <= ne[i]) && lonLat.every((n, i) => n >= sw[i])
    }
  }
}
</script>

<style scoped>
section {
  width: 100%;
  height: calc(100vh - 56px);
}
@media screen and (min-width: 950px) {
  section {
    height: calc(100vh - 64px);
  }
}
</style>
