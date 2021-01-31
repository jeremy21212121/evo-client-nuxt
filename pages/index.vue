<template>
  <div>
    <section>
      <MglMap
        ref="mapElement"
        :access-token="$config.mapBoxKey"
        :map-style="mapConfig.style"
        :center="mapConfig.center"
        :zoom="mapConfig.zoom"
        @load="onMapLoad"
        @move="onMapMove"
        @moveend="onMapMoveEnd"
        @styleimagemissing="onStyleImageMissing"
      >
        <!-- user location marker -->
        <MglMarker v-if="locationReady" :coordinates="location">
          <UserMarkerIcon slot="marker" />
          <MglPopup slot="default" v-bind="mapConfig.markers.user.popup">
            Your location
          </MglPopup>
        </MglMarker>
        <!-- vehicle markers -->
        <div v-if="vehicleDataReady">
          <MglMarker
            v-for="(vehicle, vehicleIndex) in filteredVehicles"
            :key="`v-marker-${vehicleIndex}`"
            :coordinates="extractCoords(vehicle)"
            :anchor="mapConfig.markers.vehicle.anchor"
            @click="() => mapState.activeVehicle = vehicle"
          >
            <VehicleMarker slot="marker" :active="vehicle === mapState.activeVehicle" />
          </MglMarker>
        </div>
      </MglMap>
    </section>
    <v-fab-transition>
      <v-btn
        v-show="locationReady && !mapState.activeVehicle"
        :class="'adjust-position'"
        color="#00BCE2"
        elevation="10"
        fab
        fixed
        bottom
        right
        ripple
        @click="flyToUserLocation"
      >
        <v-icon>mdi-crosshairs-gps</v-icon>
      </v-btn>
    </v-fab-transition>
    <aside v-if="mapState.activeVehicle !== null">
      <VehicleDetails
        :vehicle="mapState.activeVehicle"
        :user-location="userLocation"
        @close="mapState.activeVehicle = null"
      />
    </aside>
    <!-- Separate alert and error snackbars. This prevents an info alert replacing a serious error. [BUG] But it doesn't stop them overlapping. Fix me. -->
    <aside>
      <UserAlert v-bind="alert" @dismiss="clearAlert" />
    </aside>
    <aside>
      <UserAlert v-bind="error" :class="alert.active ? 'mt-3' : ''" @dismiss="clearError" />
    </aside>
  </div>
</template>

<script lang="js">
// Using JS because there are no types for mapbox-gl or vue-mapbox
import Mapbox from 'mapbox-gl'
import { MglMap, MglMarker, MglPopup } from 'vue-mapbox'
import { mapState, mapActions } from 'vuex'
import UserMarkerIcon from '~/components/UserMarkerIcon.vue'
import UserAlert from '~/components/UserAlert.vue'
import VehicleDetails from '~/components/VehicleDetails.vue'
import VehicleMarker from '~/components/VehicleMarker.vue'

export default {
  name: 'MainMap',
  components: {
    MglMap,
    MglMarker,
    UserMarkerIcon,
    MglPopup,
    UserAlert,
    VehicleDetails,
    VehicleMarker
  },
  async fetch () {
    // Set to defaults if there is a timeout or error
    const latLonArray = await this.getCoordsAsync(10)

    // let the user know that stuff is happening
    this.$nextTick(() => {
      this.setAlert('Loading vehicle data...')
    })
    // clone $config
    const apiConfig = Object.assign({}, this.$config)
    // Assign all the data from the anon API responses via vuex action
    await this.initStore({ config: apiConfig, position: latLonArray })
    // it can take ~4 seconds from this point until the markers near the user are rendered
    // The map onLoad handler will display a 4s 'Adding vehicles to map...' info notification
  },
  fetchOnServer: false,
  data () {
    return {
      alert: {
        active: false,
        alertType: 'info',
        message: ''
      },
      error: {
        active: false,
        alertType: 'error',
        message: ''
      },
      mapLoaded: false,
      mapbox: null,
      mapState: {
        bounds: null,
        lastMove: 0,
        error: null,
        activeVehicle: null
      },
      mapConfig: {
        style: `https://api.maptiler.com/maps/streets/style.json?key=${this.$config.mapTilerKey}`,
        // mapbox-gl uses [lon,lat] (like GeoJSON) instead of the convential [lat,long]
        defaultCenter: [-123.0680493304739, 49.25776294746344],
        // Object format, used as prop for MglMap component
        center: {
          lat: 49.25776294746344,
          lng: -123.0680493304739
        },
        // start with a close zoom. This avoids having to immediately render 1-2k markers.
        zoom: 16,
        markers: {
          vehicle: {
            color: '#292826',
            // color: '#00b3e2d1',
            anchor: 'bottom'
          },
          user: {
            popup: {
              onlyText: true,
              closeButton: false,
              closeOnClick: true,
              offset: 12
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapState(['models', 'options', 'parking', 'homezones', 'cities', 'vehicles']),
    // @returns {boolean}
    locationReady () {
      return !this.$geolocation.loading && this.$geolocation.supported && this.$geolocation.coords !== null
    },
    // @returns {[number,number]}
    location () {
      // used for centering the map and the UserMarker
      const coords = this.$geolocation.coords
      return coords ? [coords.longitude, coords.latitude] : this.mapConfig.defaultCenter
    },
    // @returns {Array}
    userLocation () {
      // slightly different semantics than location(). Used for calculating vehicle distance in VehicleDetails component.
      return this.locationReady ? this.location : []
    },
    // @returns {boolean}
    vehicleDataReady () {
      return !this.$fetchState.pending && !this.$fetchState.error && this.vehicles.length > 0
    },
    filteredVehicles () {
      // filter vehicles not currently visible to avoid having to render 1500-2000 markers at once
      let output = []
      if (this.mapState.bounds !== null) {
        output = this.vehicles.filter(car => this.inBounds(car, this.mapState.bounds))
      }
      return output
    }
  },
  created () {
    this.mapbox = Mapbox
  },
  methods: {
    ...mapActions(['initStore', 'updateAnonApiData']),
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
      const options = { timeout: 10 * 1000, maximumAge: 24 * 3600 * 1000 }
      this.setAlert('Waiting for location...')
      this.$geolocation.getCurrentPosition(options)
        .then((pos) => {
          if (pos && pos.coords) {
            this.setAlert('Location found.', 'success')
            this.$refs.mapElement.map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], essential: true })
            setTimeout(() => {
              this.setAlert('Reticulating splines...')
            }, 800)
          }
        })
        .catch((e) => {
          this.setError('Error getting location.')
          this.syncMapBounds()
          this.mapState.error = e
        })
    },
    syncMapBounds () {
      // Sync visible bounds from map obj to a reactive vue data prop
      // Updating the bounds causes the filteredVehicles computed prop to recalculate which markers should be drawn
      this.mapState.bounds = this.$refs.mapElement.map.getBounds()
      // Set lastMove time for debouncing purposes.
      // We don't want to have to recalculate the visible vehicles more than necessary.
      this.mapState.lastMove = Date.now()
    },
    onMapMove (event) {
      // We don't want to recalculate the visible markers until the map has stopped moving.
      // This event fires A LOT so we don't want to be wasting cycles recalculating what is visible until moving is done.
      if (!event.map._moving) {
        // We can't count on receiving this event with map.moving === false at the end of a move
        // We might get just this, we might get 'moveend', we might get both. For this reason we need to
        // set the bounds in both, but with debouncing in the latter to ensure we aren't doing it too often.

        // Updating the bounds causes the filteredVehicles computed prop to run
        this.syncMapBounds()
      }
    },
    onMapMoveEnd (_event) {
      const debounce = Date.now() - this.mapState.lastMove
      // debounce time chosen by trial-and-error. If we updated bounds in the last 150ms, we should be good.
      // The 'inBounds' function extends the bounds to provide a margin for error.
      if (debounce > 150) {
        // Update the bounds only if they haven't been updated in the last 150 ms.
        // This exists to ensure that all the correct markers have been added.
        // The "moveend" event only fires when the map is manually moved by the user. Calls to map.flyTo() do not trigger it.
        this.syncMapBounds()
      }
    },
    onStyleImageMissing (event) {
      // Exists solely to prevent console warnings about missing map images like "swimming_pool_11"
      // this event handler seems to have been added in a later version of mapbox-gl-js. I'll leave it for now.
      // Do nothing, I don't care about billiards icons etc but it's junking up my console.
      // https://github.com/mapbox/mapbox-gl-js/pull/8684
      event.preventDefault()
      event.stopPropagation()
    },
    /**
     * @param {AvailableVehicle} vehicle
     * @param {Object} bounds
     * @param {LngLatLike} bounds._ne
     * @param {LngLatLike} bounds._sw
     * @returns {boolean}
     */
    inBounds (vehicle, bounds) {
      // get the data into the format we need for performing the comparison
      const lonLat = [vehicle.location.position.lon, vehicle.location.position.lat]
      // slightly increase the size of the bounds to make sure we capture markers that are on the edge
      const ne = [bounds._ne.lng, bounds._ne.lat].map(n => n + 0.001)
      // for the SW coords we must decrease them slightly to increase the bounds area
      const sw = [bounds._sw.lng, bounds._sw.lat].map(n => n - 0.001)
      // vehicle position is LT or == North/East Bounds  &&  GT or == South/West bounds
      return lonLat.every((n, i) => n <= ne[i]) && lonLat.every((n, i) => n >= sw[i])
    },
    clearAlert () {
      this.alert.active = false
      // this.alert.alertType = 'info'
      this.alert.message = ''
    },
    setAlert (message, type = 'info') {
      this.clearAlert()
      // wait a tick in case there is an exisiting alert
      // it won't trigger if we don't wait a tick
      this.$nextTick(() => {
        this.alert.message = message
        this.alert.alertType = type
        this.alert.active = true
      })
    },
    clearError () {
      this.error.active = false
      this.error.message = ''
    },
    setError (message, type = 'error') {
      this.clearError()
      // wait a tick in case there is an exisiting alert
      // it won't trigger if we don't wait a tick
      this.$nextTick(() => {
        this.error.message = message
        this.error.alertType = type
        this.error.active = true
      })
    },
    flyToUserLocation () {
      this.$refs.mapElement.map.flyTo({ center: this.location, essential: true, zoom: 16 })
      setTimeout(() => {
        this.setAlert('Reticulating splines...')
      }, 800)
    }
  }
}
</script>

<style scoped>
section {
  width: 100%;
  height: calc(100vh - 56px);
}
button.adjust-position {
  bottom: 24px;
  right: 24px;
}
@media screen and (min-width: 950px) {
  section {
    height: calc(100vh - 64px);
  }
}
</style>
