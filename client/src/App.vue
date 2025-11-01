<script>
import { RouterView } from "vue-router";
import { getAuth } from "./services/index";

import Notification from "./components/elements/Notification.vue";

export default {
  components: { Notification },
  data() {
    return {
      notification: {},
    };
  },
  watch: {
    "$store.state.notification": {
      immediate: true,
      handler(notif) {
        this.notification = notif;
      },
    },
  },
  async mounted() {
    let bearer = localStorage.getItem("bearer");
    if (bearer?.length) {
      const auth = await getAuth(this.$store.state.apiURI, bearer);
      if (!auth.success) {
        localStorage.setItem("bearer", "");
      }
    }
  },
  methods: {},
};
</script>

<template>
  <div>
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <Component :is="Component" :key="$route.path" />
      </Transition>
    </RouterView>
    <Notification
      :key="notification"
      v-if="notification"
      :notif="notification"
    />
  </div>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
