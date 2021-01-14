# Evo API client and web application for viewing available vehicles

> Made with Nuxt & TypeScript

Features a reverse-engineered vulog v5 API client written in TypeScript, based on [this earlier effort](https://github.com/jeremy21212121/evo-re) first prototyped in Bash, then JavaScript.

The API client and Nuxt plugin live in the `/plugins` directory.

## Why?

They took away my web interface, which I relied on. Being unable and unwilling to use their native mobile apps, I decided to reverse-engineer their API and build a web interface. Vivre le web!

## Status

The anonymous API client is fully functional and typed in TypeScript. The authenticated API (allows booking, unlocking) still needs to be implemented.

The basic API client is found in the plugins directory (`/plugins/AnonApi/`) and the Nuxt plugin is in `/plugins/anonApiData.ts`.

The MVP is now about 75% complete. I am making use of some `Vuetify` components and `VueMapbox` for the map interface. `VueMapbox` handles the GeoJSON format returned by both the parking and homezones endpoints.

## Future plans

The next priority is to finish implementing the basic UI, allowing the user to list available vehicles and view them on the map. It is now functional but needs the "car details" component to be made.

After that, I will implement the authenticated API for operations like booking and unlocking a vehicle. I took a preliminary capture and I have it largely documented.

At some point I will need to write some tests for both the TypeScript API client and the UI. I want to have a fully-functional MVP before I worry about that.


## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
