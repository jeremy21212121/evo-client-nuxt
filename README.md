# Evo API client and web application for viewing available vehicles

> Made with Nuxt & TypeScript

**Early alpha-quality release available now at** [evofinder.ca](https://evofinder.ca)

Features a RE'd vulog v5 API client written in TypeScript, based on [this earlier effort](https://github.com/jeremy21212121/evo-re) first prototyped in Bash, then JavaScript.

The API client and Nuxt plugin live in the `/plugins` directory.

## Why?

They took away my web interface, which I relied on. Being unable and unwilling to use their native mobile apps, I decided to reverse-engineer their API and build a web interface. Vivre le web!

## Status

There is an early alpha-quality MVP now available at [evofinder.ca](https://evofinder.ca). It has some bugs on larger devices, but works well on mobile. Users can see available vehicles near them on a map, and get some details about the vehicle. More to come!

The anonymous API client is fully functional and typed in TypeScript. The authenticated API (allows booking, unlocking) still needs to be implemented.

The basic API client is found in the plugins directory (`/plugins/AnonApi/`) and the Nuxt plugin is in `/plugins/anonApiData.ts`.

## Future plans

Lots of refinements and new features to come. Stay tuned!

At some point I will need to write some tests for both the TypeScript API client and the UI. I want to have a fully-functional MVP before I worry too much about that.

The API client should live in its own repo and get added to npm for ease of use. We shall see when I get around to that.


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
