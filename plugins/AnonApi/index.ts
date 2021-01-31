/**
 * Class that enables easy use of the anonymous portion of a certain white-label car share platforms API. Works in the browser and with Node.js.
 * Every type that has a non-obvious purpose should be documented with a comment. There are a variety of relative IDs that refer to a non-obvious data type.
 *
 * The API uses certain unusual approaches which are either terrible mistakes or some sort of very weak obfuscation. Examples include:
 * - Abusing the OpenID-Connect protocol (Not using the refresh token, requesting new tokens repeatedly and long before their stated expiration time)
 * - Calling certain API endpoints multiple times
 * The implementation of the above can be found in the only public method: AnonApi.Data.getAll
 *
 * Right now the types and implementation all live in this same file. This should ideally live in its own repo, be made into a module,
 * and be published to NPM to make it easy to use anywhere.
 */

import axios, { AxiosRequestConfig, AxiosInstance } from 'axios'
import { FeatureCollection } from 'geojson'

export namespace AnonApi {
  /******************************
   * Types
   *****************************/

  // Used in the Token class implementation. Such an object must be passed to the constructor. You will need to provide these values yourself.
  export interface Config {
    identityBaseUrl: string;
    anonymousClientId: string;
    anonymousClientSecret: string;
    anonymousBaseUrl: string;
    anonymousApiKey: string;
    secureClientId: string;
    secureClientSecret: string;
    secureBaseUrl: string;
    secureApiKey: string;
    userAgent: string;
  }

  export class TokenResponse {
    accessToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    refreshToken: string;
    tokenType: string;
    // Simply camel-cases the prop names to satisfy eslint and convention
    constructor (obj: any) {
      this.accessToken = obj.access_token
      this.expiresIn = obj.expires_in
      this.refreshExpiresIn = obj.refresh_expires_in
      this.refreshToken = obj.refresh_token
      this.tokenType = obj.token_type
    }
  }

  export interface VehicleModel {
    autonomy: number;
    autonomyUnit: string;
    energyType: string;
    iconsUrl: string;
    id: number;
    manufacturer: string | null;
    name: string;
    pricingInfo: string | null;
    seats: number;
    tokenIconsUrl: string;
    vehicleType: string;
  }

  export type VehicleModels = VehicleModel[]

  // We don't currently know this as the response array is empty
  export interface Option {
    [propName: string]: any
  }

  export type Options = Option[]

  interface GeoJsonWrapper {
    // Common base for ParkingArea and Homezone
    // It doesn't appear to be part of GeoJSON spec
    id: string; // ("pois" || "zones")-$serviceId
    serviceId: string; // Service.id
    serviceType: string; // "FREE_FLOATING"
    serviceVisibility: string; // "PUBLIC"
  }

  export interface ParkingArea extends GeoJsonWrapper {
    content: FeatureCollection
  }

  // length should be 1 but the response could change in the future
  export type ParkingAreas = ParkingArea[]

  export interface Homezone extends GeoJsonWrapper {
    zone: FeatureCollection
  }

  // length should be 1 but we still have to check at runtime because it could change
  export type Homezones = Homezone[]

  /**
   * Cities
   */

  export interface City {
    contactPhoneNumber: string | null; // null
    contactUrl: string | null; // null
    // eslint-disable-next-line camelcase
    currency_code: string; // "CAD"
    distanceUnit: string; // "KM"
    faqUrl: string | null; // null
    homezoneIds: string[]; // length = 1
    id: string; // uuid used for requesting availableVehicles
    imagesUrl: string; // full url
    layerIds: string[]; // length = 1
    locale: string; // "en_CA"
    name: string; // "Vancouver"
    position: Position;
    radius: number; // 3 * 10 ** 6
    services: Service[]; // length should be 1
    termsOfUseUpdateDatetime: Date; // datetimestring
    termsOfUseUrl: string; // "https://todo.com"
    timeZone: string; // "America/Vancouver"
    tokenIconsUrl: string | null; // null
    zoneId: string | null; // null
    zoomLevel: number; // 10
  }

  interface Service {
    bookingValidity: number; // -1
    cityId: string; // City.id
    id: string; // uuid
    maxConcurrentTrips: number; // 1
    name: string; // "Car sharing"
    pois: string[]; // Parking.content.features[i].properties.poiId
    status: string; // "ACTIVE"
    type: string; // "FREE_FLOATING"
    vehiclesInService: number; // 1564
    visibility: string; // "PUBLIC"
    zoneFillColor: string | null; // null
    zoneOutlineColor: string| null; // null
    zones: string[]; // Homezone.zone.features[i].properties.zoneId
  }

  export interface Position {
    lat: number;
    lon: number;
  }

  // length should be 1 but that could change in the future
  export type Cities = City[];

  /**
   * Available vehicles
   */

  export interface AvailableVehicle {
    description: Description;
    location: Location;
    status: Status;
    // We use this to store the distance from the user
    distance?: number;
  }

  export interface Description {
    cityId: string; // uuid
    iconsUrl: string; // full url
    id: string; // uuid
    model: string; // 'Prius', 'Prius C'
    modelId: number;// 114, 90
    name: string; // $license_plate - $last_11_of_vin
    optionIds: any[]; // empty in practice
    plate: string; // plate with space in the middle
    pricingInfo: {
      pricingId: string; // uuid
      type: string; // "fleet"
    }
    serviceId: string; // uuid
    tokenIconsUrl: string; // uuid
  }

  export interface Location {
    address: { country: string }; // Just an empty string in practice
    position: Position;
  }

  export interface Status {
    energyLevel: number; // fuel percentage
    energyLevel2: number; // seems to always be 0
    isCharging: boolean; // seems to be false
  }

  export type AvailableVehicles = AvailableVehicle[];

  export type Response = VehicleModels | Options | ParkingAreas | Cities | AvailableVehicles

  /****************
   * Implementation
   ****************/

    /*
    * Class has one main protected method, `async getToken()`
    * It keeps track of the expiration and will get a new token automatically (Doesn't currently matter as the expiry time seems to be a lie).
    * For some reason the refresh endpoint isn't used so we just request new tokens as needed. A new token can be manually requested as needed
    * with the protected method `async fetchNewToken()`.
    */
   class Token {
    // Static data that is POST-ed with form encoding
    protected tokenData: Array<[string, string]>
    protected tokenType: string = ''
    protected accessToken: string = ''
    protected tokenExpiry: number = 0
    private config: Config

    constructor (config: Config) {
      this.config = config
      this.tokenData = [['scope', ''], ['client_id', config.anonymousClientId], ['client_secret', config.anonymousClientSecret], ['grant_type', 'client_credentials']]
    }

    // Needs to be called by extending class to manually get new token. This is needed to work around some weirdness in the API.
    protected fetchNewToken = async (): Promise<void> => {
      const params = new URLSearchParams()
      // Build form-encoded data to be used as POST body
      this.tokenData.forEach(kvArr => params.append(...kvArr))
      const options: AxiosRequestConfig = {
        method: 'POST',
        headers: {
          // The headers come from a `mitmproxy` traffic capture
          'content-type': 'application/x-www-form-urlencoded',
          // Some browsers, including Chrome, will refuse to set the 'user-agent' header. This results in an error in the console, but it does not cause the request to fail.
          // Other browsers, like Firefox, and server-side environments like Node.js will allow you to set this header without complaining.
          // It doesn't seem to be terribly important, the requests will still succeed regardless. I could write some logic to conditionally add the header but that is a bit hacky.
          // For now I will just leave it, mapbox already makes a mess of the console.
          'user-agent': this.config.userAgent
        },
        data: params,
        url: this.config.identityBaseUrl
      }
      // Make the API request
      const response = await axios(options)
      // Parse token from API response to ensure it has all expected properties and to convert them from snake_case to camelCase.
      const anonToken = new AnonApi.TokenResponse(response.data)
      this.tokenType = anonToken.tokenType
      this.accessToken = anonToken.accessToken
      // Set token expiry time 50ms before actual to provide a buffer
      this.tokenExpiry = anonToken.expiresIn * 1000 + Date.now() - 50
    }

    private isTokenValid = (): boolean => this.tokenExpiry > Date.now()

    protected getToken = async (): Promise<string> => {
      if (!this.isTokenValid()) {
        // No valid token, so fetch one first
        await this.fetchNewToken()
      }
      // Returns token string in the format required for the Authorization header value
      return `${this.tokenType} ${this.accessToken}`
    }
   }

  /*
  * Makes use of the Token class to make authorized calls to the anonymous (not logged in) API endpoints
  */
  class Request extends Token {
    protected axiosInstance: AxiosInstance

    constructor (config: Config) {
      super(config)
      // Auth header will be added at call time. Headers are chosen to match android app.
      this.axiosInstance = axios.create({
        baseURL: config.anonymousBaseUrl,
        headers: {
          'user-agent': config.userAgent,
          'X-API-Key': config.anonymousApiKey,
          accept: 'application/json',
          'content-type': 'application/json'
        },
        // Modified JSON parsing to handle non-standard JSON intended to cause errors.
        // We are no longer seeing this but we will keep it for now as it doesn't effect valid JSON.
        transformResponse: res => JSON.parse(res.replace(/^\[\](?=\[)/, ''))
      })
    }

    // Method for making API requests
    protected getPath = async (path: string, headers = {}): Promise<Response> => {
      // Gets a valid token string
      const tokenString = await this.getToken()
      // Auth header needs to be added at function run time to ensure it is valid
      const mergedHeaders = Object.assign(
        { authorization: tokenString },
        headers
      )
      const options: AxiosRequestConfig = { method: 'GET', headers: mergedHeaders, url: path }
      const response = await this.axiosInstance(options)
      return response.data as Response
    }
  }

  /*
  * Used to get all data from the anon API
  * Extends the AnonApi.Request class
  * I've been reading too much Java/Kotlin code and now everything is a class :P
  * NB - Must be instantiated with a AnonApi.Config object, as can be found in the AnonApi.Request class constructor
  */
  export class Data extends Request {
    // lat/lon defaults to downtown Vancouver if none is provided
    public getAll = async (
      lat = 49.279844999999995,
      lon = -123.10200666666667
    ): Promise<[VehicleModels, Options, ParkingAreas, Homezones, Cities, AvailableVehicles]> => {
      /*
        * Manually request a token twice.
        * For some bizarre reason we have to request two tokens before making any API calls. I guess it is an attempt at obscurity.
        */
      await this.fetchNewToken()
      await this.fetchNewToken()
      /*
        Fetch car models. Doesn't seem to change frequently. Returns an array of 3 objects. We are interested in the first 2 (Prius, Prius C), the last one seems to be for testing purposes.
      *
        The vehicle names are used to fetch images such as https://mobile-asset-resources.vulog.center/PROD_US/BCAA-CAYVR/mobile_resources/models/Prius/android/xxhdpi/model.png?f620633d-7098-49ba-88e0-e54f8ef72a18
        The query string from the end of the image url comes the "tokenIconsUrl" prop in this response. Interestingly, only 1/3 succeeded ("Prius"), but this may be because we are not currently logged in.
        It is not necessary, for our purposes, to request the images. They are hosted on a different server and do not currently make up part of the bizarre obfuscation process.
      */
      const models = await this.getPath('/models')
      /*
        * Fetch options. Doesn't seem to change. Returns an empty array. This request remains to simulate the real client app as faithfully as possible.
        */
      const options = await this.getPath('/options')
      /*
        * Fetch parking location data. Doesn't change often. Returns somewhat complex JSON. We are interested in the "response[0].content.features" array.
        */
      const parking = await this.getPath('/mapping/layers')
      /*
        * Fetch homezones area data. Doesn't change often. Returns somewhat complex JSON. We are interested in the "response[0].zone.features" array.
        */
      const homezones = await this.getPath('/mapping/homezones')
      /*
        * Fetch cities. The bulk is made up of IDs that refer to results from the previous two requests (parking and homezones).
        * The response is an array containing a single large object as their service is only offered in one metro area.
        * We need the city ID to request the available cars in the next request.
        */
      const cities = await this.getPath('/cities')

      // Manually request a new token because that is what the real app does.
      /*
        * User lat/lon are included as headers. Defaults to downtown vancouver.
        */
      const vehicles = await this.getPath(
        `/availableVehicles/${cities[0].id}`,
        { 'user-lat': lat, 'user-lon': lon }
      )

      return [models as VehicleModels, options as Options, parking as ParkingAreas, homezones as Homezones, cities as Cities, vehicles as AvailableVehicles]
    } // getAll
  }// Data
}// AnonApi namespace
