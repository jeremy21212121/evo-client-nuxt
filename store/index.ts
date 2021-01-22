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

let anonApiData: null|AnonApi.Data = null
// state API data property names in order
const dataNames = ['models', 'options', 'parking', 'homezones', 'cities', 'vehicles']

export const state = () => ({
  models: [] as AnonApi.VehicleModels,
  options: [] as AnonApi.Options,
  parking: [] as AnonApi.ParkingAreas,
  homezones: [] as AnonApi.Homezones,
  cities: [] as AnonApi.Cities,
  vehicles: [] as AnonApi.AvailableVehicles,
  errorStatus: {
    hasError: false
  } as ErrorStatus
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
  SET_ERROR_STATUS: (state, newErrorStatus: ErrorStatus) => (state.errorStatus = newErrorStatus)
}

interface InitStorePayload {
  config: AnonApi.Config,
  position: [lat: number, lon: number]
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
      // vehicles returned are sorted by proximity to $position
      const responses = await anonApiData.getAll(...position)
      // commits each response to the store
      responses.forEach((response, index) => {
        const mutationName = `SET_${dataNames[index].toLocaleUpperCase()}`
        context.commit(mutationName, response)
      })
    } catch (error) {
      context.commit('SET_ERROR_STATUS', { hasError: true, error })
    }
  }
}
