<script>
import { getAuth } from "../services/index";

import Nav from "../components/elements/Nav.vue";
export default {
  components: { Nav },
  data() {
    return {
      users: [],
      activeNum: 0,
    };
  },
  watch: {
    "$store.state.notification": {
      immediate: true,
      handler(notif) {
        if (notif.success === "") {
          this.$store.dispatch("updateNotification", {
            success: "Already logged in.",
          });
        }
      },
    },
    "$store.state.search": {
      immediate: true,
      handler(search) {
        this.setActive(0);
      },
    },
  },
  async mounted() {
    this.$store.dispatch("updateUsers", this.users);

    let bearer = localStorage.getItem("bearer");
    if (bearer) {
      if (bearer.length) {
        let auth = await getAuth(this.$store.state.apiURI, bearer);
        if (!auth.success) {
          localStorage.setItem("bearer", "");
        }
      }
    }
  },
  methods: {
    setActive(num) {
      this.activeNum = num;
    },
  },
};
</script>

<template>
  <div class="container py-5 px-sm-5">
    <div class="py-5">
      <Nav />
      <div class="frosted rounded-3 p-1 mt-2">
        <div class="h-100 rounded-3 row g-0 position-relative">
          <div
            class="active rounded-3"
            :style="{ left: activeNum * (100 / 3) + '%' }"
          ></div>
          <div
            class="col-4 text-center fw-bold p-2 rounded-3 btn-nav"
            @click="setActive(0)"
          >
            Placeholder
          </div>
          <div
            class="col-4 text-center fw-bold p-2 rounded-3 btn-nav"
            @click="setActive(1)"
          >
            Placeholder
          </div>
          <div
            class="col-4 text-center fw-bold p-2 rounded-3 btn-nav"
            @click="setActive(2)"
          >
            Placeholder
          </div>
        </div>
      </div>
      <div class="rounded-3 mt-2">
        <Transition name="fade" mode="out-in">
          <div class="rounded-3 text-center" :key="activeNum">
            <div class="w-100" v-if="activeNum == 0">
            </div>
            <div class="w-100" v-if="activeNum == 1">
            </div>
            <div class="w-100" v-if="activeNum == 2">
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  height: 100vh;
}
</style>
