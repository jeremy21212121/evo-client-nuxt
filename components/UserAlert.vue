<template>
  <v-snackbar
    :color="alertType"
    :elevation="10"
    :timeout="timeout"
    :value="active"
    app
    centered
    top
  >
    <v-icon color="white">
      {{ icon }}
    </v-icon>
    <span>
      {{ message }}
    </span>
    <v-btn
      slot="action"
      color="white"
      text
      @click="$emit('dismiss')"
    >
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  name: 'UserAlert',
  props: {
    active: {
      type: Boolean,
      default: false
    },
    alertType: {
      type: String,
      // 'info', 'error', 'success'
      default: 'info'
    },
    message: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      // activeOverride: false
      iconMap: {
        info: 'information',
        error: 'alert-circle',
        success: 'check-circle'
      }
    }
  },
  computed: {
    timeout () {
      return (this.alertType === 'error') ? -1 : 4000
    },
    icon () {
      return `mdi-${this.iconMap[this.alertType]}`
    }
  }
}
</script>
