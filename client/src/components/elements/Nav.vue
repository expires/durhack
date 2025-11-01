<script>
import { filterInput } from "../../utils/input";
import { deleteLogout } from "../../services/index";

export default {
  data() {
    return {
      inputValue: "",
      timeoutId: null,
      bearer: localStorage.getItem("bearer") || "",
    };
  },
  mounted() {},

  methods: {
    emitInputValueDebounced: function () {
      filterInput(this.inputValue);
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.$store.dispatch("updateSearch", this.inputValue);
      }, 100);
    },
    async logout() {
      this.$router.push("/login");
      localStorage.setItem("bearer", "");
      let result = await deleteLogout(this.$store.state.apiURI, this.bearer);
      if (result.error) {
        this.$store.dispatch("updateNotification", result);
      } else {
        this.$store.dispatch("updateNotification", result);
      }
    },
  },
};
</script>

<template>
  <nav class="">
    <div class="container-fluid px-0 mx-0 custom-row">
      <a class="custom-col-1 me-2">
        <img
          src="@/assets/images/logo.png"
          style="border: solid 3px rgba(127, 124, 124, 0.22)"
          alt=""
          width="48"
          class="rounded-3"
        />
      </a>
      <div class="custom-col-2 p-0">
        <div class="row m-0 h-100 gx-2">
          <div class="col-6">
            <div class="input-container h-100 rounded-3">
              <i class="uil uil-search"></i>
              <input
                type="text"
                class="w-100 h-100 pe-3"
                placeholder="Search..."
                v-model="inputValue"
                @input="emitInputValueDebounced"
              />
            </div>
          </div>
          <div class="col-3">
            <RouterLink v-if="bearer.length < 1" to="/login">
              <button class="btn btn-primary w-100 h-100">Login</button>
            </RouterLink>
            <RouterLink v-else to="/dashboard">
              <button class="btn btn-primary w-100 h-100">Dashboard</button>
            </RouterLink>
          </div>
          <div class="col-3">
            <RouterLink v-if="bearer.length < 1" to="/signup">
              <button class="btn btn-primary w-100 h-100">Signup</button>
            </RouterLink>
            <button v-else class="btn btn-primary w-100 h-100" @click="logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.custom-row {
  display: flex;
}

.custom-col-1 {
  width: 48px;
}

.custom-col-2 {
  flex-grow: 1;
}
</style>
