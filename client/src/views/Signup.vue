<script>
import { postSignup } from "../services/index";

import Layout from "../layouts/AuthLayout.vue";

export default {
  components: { Layout },
  data() {
    return {
      activeNum: 0,
      email: "",
      username: "",
      password: "",
      buttonActive: true,
      showPassword: false,
    };
  },

  watch: {
    "$store.state.notification": {
      immediate: true,
      handler(notif) {
        if (notif.success === "Already logged in.") {
          this.$store.dispatch("updateNotification", { success: "" });
          this.$router.push("/");
        }
      },
    },
  },
  async mounted() {},
  methods: {
    Password(arg) {
      if (arg == "Hide") {
        this.showPassword = false;
      } else {
        this.showPassword = true;
      }
    },
    setActive(num) {
      this.activeNum = num;
    },
    async signup() {
      this.buttonActive = false;
      if (!this.username || !this.password || !this.email) {
        this.$store.dispatch("updateNotification", {
          error: "Please provide all required information.",
        });
        this.buttonActive = true;
        return 0;
      }
      let body = {
        email: this.email,
        username: this.username,
        password: this.password,
      };
      let result = await postSignup(this.$store.state.apiURI, body);
      this.buttonActive = true;
      if (result.error) {
        this.$store.dispatch("updateNotification", result);
      } else {
        this.$store.dispatch("updateNotification", result.success);
        localStorage.setItem("bearer", result.token);
        this.$router.push("/");
      }
    },
  },
};
</script>

<template>
  <Layout>
    <div>
      <div class="input-container h-100 rounded-3 mb-2">
        <i class="uil uil-at" style="color: white"></i>
        <input
          type="text"
          class="w-100 h-100 pe-3"
          placeholder="Email"
          v-model="email"
          @keyup.enter="signup"
        />
      </div>
      <div class="input-container h-100 rounded-3 mb-2">
        <i class="uil uil-users-alt" style="color: white"></i>
        <input
          type="text"
          class="w-100 h-100 pe-3"
          placeholder="Username"
          v-model="username"
          @keyup.enter="signup"
        />
      </div>
      <div class="input-container mt-2 h-100 rounded-3 position-relative">
        <i class="uil uil-lock" style="color: white"></i>
        <Transition name="fade" mode="out-in">
          <input
            :key="showPassword"
            :type="showPassword ? 'text' : 'password'"
            class="w-100 h-100 pe-3"
            placeholder="Password"
            v-model="password"
            @keyup.enter="signup"
          />
        </Transition>

        <Transition name="fade" mode="out-in">
          <div :key="showPassword">
            <i
              v-if="!showPassword"
              class="uil uil-eye text-light"
              style="cursor: pointer"
              @click="Password('')"
            ></i>
            <i
              v-else
              class="uil uil-eye-slash text-light"
              style="cursor: pointer"
              @click="Password('Hide')"
            ></i>
          </div>
        </Transition>
      </div>
      <button
        class="btn btn-primary w-100 mt-2"
        :disabled="!buttonActive"
        @click="signup"
      >
        <Transition name="fade" mode="out-in">
          <div :key="buttonActive">
            <span v-if="!buttonActive" class="fw-bolder"
              ><div
                class="spinner-border spinner-border-sm color-primary"
                role="status"
              ></div
            ></span>
            <span v-else class="fw-bolder color-primary">Signup</span>
          </div>
        </Transition>
      </button>
      <p class="mt-3 text-center fw-bolder">
        Already got an account? Login
        <RouterLink to="/login">here</RouterLink>
      </p>
    </div>
  </Layout>
</template>

<style lang="scss" scoped></style>
