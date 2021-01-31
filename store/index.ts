/**
 * Adapted from https://typescript.nuxtjs.org/cookbook/store
 */
import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
// import nuxtConfig from '~/nuxt.config.ts'
import { AnonApi } from '~/plugins/AnonApi/index'

interface ErrorStatus {
  hasError: boolean,
  error?: Error
}

interface InitStorePayload {
  config: AnonApi.Config,
  position: [lat: number, lon: number]
}

let anonApiData: null|AnonApi.Data = null
// state API data property names in order
const dataNames = ['models', 'options', 'parking', 'homezones', 'cities', 'vehicles']

// Returns distance, in meters, between two sets of co-ordinates
const geoDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRadians = (deg: number) => deg * Math.PI / 180
  const latRad1 = toRadians(lat1)
  const latRad2 = toRadians(lat2)
  const lonDiffRad = toRadians(lon2 - lon1)
  const R = 6371e3
  return Math.round(Math.acos(Math.sin(latRad1) * Math.sin(latRad2) + Math.cos(latRad1) * Math.cos(latRad2) * Math.cos(lonDiffRad)) * R)
}

const addDistanceToVehicle = (vehicle: AnonApi.AvailableVehicle, userPosition: [lat: number, lon: number]): AnonApi.AvailableVehicle => {
  const vehiclePosition = vehicle.location.position
  vehicle.distance = geoDistance(vehiclePosition.lat, vehiclePosition.lon, ...userPosition)
  return vehicle
}

const sortVehiclesByDistance = (vehicles: AnonApi.AvailableVehicles) => vehicles.sort((a, b) => (a.distance && b.distance) ? a.distance - b.distance : 0)

export const state = () => ({
  models: [] as AnonApi.VehicleModels,
  options: [] as AnonApi.Options,
  parking: [] as AnonApi.ParkingAreas,
  homezones: [] as AnonApi.Homezones,
  cities: [] as AnonApi.Cities,
  vehicles: [] as AnonApi.AvailableVehicles,
  errorStatus: {
    hasError: false
  } as ErrorStatus,
  // latLon: [] as number[],
  position: { lat: 49.25776294746344, lon: -123.0680493304739 } as AnonApi.Position
})

export type RootState = ReturnType<typeof state>

// Dumb getters are an antipattern. I like to use mapState() instead, unless there is some logic required.
export const getters: GetterTree<RootState, RootState> = {
  /**
   * Gets an array of the 10 nearest available vehicles
   * @returns {AnonApi.AvailableVehicles(10)}
   */
  nearestVehicles: (state): AnonApi.AvailableVehicles => state.vehicles.slice(0, 10)
}

export const mutations: MutationTree<RootState> = {
  SET_MODELS: (state, newModels: AnonApi.VehicleModels) => (state.models = newModels),
  SET_OPTIONS: (state, newOptions: AnonApi.Options) => (state.options = newOptions),
  SET_PARKING: (state, newParking: AnonApi.ParkingAreas) => (state.parking = newParking),
  SET_HOMEZONES: (state, newHomezones: AnonApi.Homezones) => (state.homezones = newHomezones),
  SET_CITIES: (state, newCities: AnonApi.Cities) => (state.cities = newCities),
  SET_VEHICLES: (state, newVehicles: AnonApi.AvailableVehicles) => (state.vehicles = newVehicles),
  SET_ERROR_STATUS: (state, newErrorStatus: ErrorStatus) => (state.errorStatus = newErrorStatus),
  SET_POSITION: (state, newPosition: AnonApi.Position) => (state.position = newPosition),
  SORT_VEHICLES: (state, newPosition: [lat: number, lon: number]) => {
    // mutate vehicle object distance property
    state.vehicles.forEach(vehicle => addDistanceToVehicle(vehicle, newPosition))
    // sort array in-place
    sortVehiclesByDistance(state.vehicles)
  }
}

export const actions: ActionTree<RootState, RootState> = {
  /**
   * Initializes the AnonApi.Data class and dispatches the updateAnonApiData action
   */
  async initStore (context: ActionContext<RootState, RootState>, payload: InitStorePayload) {
    // initialize class
    anonApiData = new AnonApi.Data(payload.config)
    await context.dispatch('updateAnonApiData', payload.position)
  },
  /**
   * Updates all available information from the anon API
   */
  async updateAnonApiData (context: ActionContext<RootState, RootState>, position: [lat: number, lon: number]) {
    try {
      if (anonApiData === null) {
        throw new Error('Object "anonApiData" has not been initialized.')
      }
      context.commit('SET_POSITION', { lat: position[0], lon: position[1] } as AnonApi.Position)
      // vehicles returned are sorted by proximity to $position
      const responses = await anonApiData.getAll(...position)
      // Calculate distance between vehicles and user for sorting.
      // We are not using the 'SORT_VEHICLES' mutation because the vehicles haven't been added to the store yet.
      responses[5].forEach(vehicle => addDistanceToVehicle(vehicle, position))
      // Sort vehicles by proximity to user
      sortVehiclesByDistance(responses[5])
      // commits each response to the store
      responses.forEach((response, index) => {
        const mutationName = `SET_${dataNames[index].toLocaleUpperCase()}`
        context.commit(mutationName, response)
      })
    } catch (error) {
      context.commit('SET_ERROR_STATUS', { hasError: true, error })
    }
  },
  setPosition (context: ActionContext<RootState, RootState>, position: AnonApi.Position) {
    context.commit('SET_POSITION', position)
    context.commit('SORT_VEHICLES', [position.lat, position.lon])
  }
}
