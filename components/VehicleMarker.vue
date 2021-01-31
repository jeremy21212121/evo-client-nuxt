<template>
  <svg viewBox="0 0 27 41"><g transform="translate(3 29)"><ellipse opacity=".04" cx="10.5" cy="5.8" rx="10.5" ry="5.25" /><ellipse opacity=".04" cx="10.5" cy="5.8" rx="10.5" ry="5.25" /><ellipse opacity=".04" cx="10.5" cy="5.8" rx="9.5" ry="4.77" /><ellipse opacity=".04" cx="10.5" cy="5.8" rx="8.5" ry="4.3" /><ellipse opacity=".04" cx="10.5" cy="5.8" rx="7.5" ry="3.82" /><ellipse opacity=".04" cx="10.5" cy="5.8" rx="6.5" ry="3.34" /><ellipse opacity=".04" cx="10.5" cy="5.8" rx="5.5" ry="2.86" /><ellipse opacity=".04" cx="10.5" cy="5.8" rx="4.5" ry="2.39" /></g><path d="M27 13.5c0 5.57-6.75 13.5-12.25 21-.73 1-1.77 1-2.5 0C6.75 27 0 19.22 0 13.5a13.5 13.5 0 0127 0z" :fill="colour" /><path d="M13.5 0A13.5 13.5 0 000 13.5c0 5.72 6.75 13.5 12.25 21 .75 1.02 1.77 1 2.5 0C20.25 27 27 19.07 27 13.5A13.5 13.5 0 0013.5 0zm0 1C20.42 1 26 6.58 26 13.5c0 2.4-1.5 5.68-3.78 9.24-2.27 3.56-5.51 7.4-8.28 11.17-.2.27-.33.41-.44.53a4.93 4.93 0 01-.44-.53c-2.78-3.78-5.65-7.6-8.04-11.14C2.62 19.23 1 15.95 1 13.5 1 6.58 6.58 1 13.5 1z" opacity=".25" /><g transform="translate(8 8)"><circle opacity=".25" cx="5.5" cy="5.5" r="5.5" /><circle fill="#FFF" cx="5.5" cy="5.5" r="5.5" /></g></svg>
</template>

<script>
export default {
  name: 'VehicleMarker',
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      markers: {
        inactive: '#292826',
        active: '#2BBDE1'
      }
    }
  },
  computed: {
    colour () {
      return this.active ? this.markers.active : this.markers.inactive
    }
  }
}
</script>

<style scoped>
svg {
  width: 27px;
  height: 41px;
}
</style>
