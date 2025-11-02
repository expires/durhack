<script>
import { postLogin } from "../services/index";

import Layout from "../layouts/AuthLayout.vue";

export default {
  components: { Layout },
  data() {
    return {
      activeNum: 0,
      username: "",
      password: "",
      stayLoggedIn: false,
      buttonActive: true,
      showPassword: false,
      role: "patient",
      roles: [
        { label: "Patient", value: "patient" },
        { label: "Hospital", value: "hospital" },
        { label: "Doctor", value: "doctor" },
        { label: "Researcher", value: "researcher" },
        { label: "Auditor / Compliance", value: "auditor" },
        { label: "Insurance / Billing", value: "insurance" },
        { label: "Emergency Responder", value: "emergency" },
      ],
    };
  },

  watch: {
    "$store.state.notification": {
      immediate: true,
      handler(notif) {
        if (
          notif.success === "Already logged in." &&
          localStorage.getItem("bearer").length > 0
        ) {
          this.$store.dispatch("updateNotification", { success: "" });
          const role = localStorage.getItem("role");
          const providerRoles = [
            "hospital",
            "doctor",
            "researcher",
            "auditor",
            "insurance",
            "emergency",
          ];
          this.$router.push(
            providerRoles.includes(role) ? "/hospital" : "/dashboard"
          );
        }
      },
    },
  },
  async mounted() {},
  methods: {
    setActive(num) {
      this.activeNum = num;
    },
    Password(arg) {
      if (arg == "Hide") {
        this.showPassword = false;
      } else {
        this.showPassword = true;
      }
    },
    async login() {
      this.buttonActive = false;
      if (!this.username || !this.password) {
        this.$store.dispatch("updateNotification", {
          error: "Please provide all required information.",
        });
        this.buttonActive = true;
        return 0;
      }
      let body = {
        username: this.username,
        password: this.password,
        stayLoggedIn: this.stayLoggedIn,
        role: this.role,
      };
      let result = await postLogin(this.$store.state.apiURI, body);
      this.buttonActive = true;
      if (result.error) {
        this.$store.dispatch("updateNotification", result);
      } else {
        this.$store.dispatch("updateNotification", result.success);
        localStorage.setItem("bearer", result.token);
        if (result.user) {
          this.$store.dispatch("updateUser", result.user);
          localStorage.setItem("role", result.user.role);
        }
        const providerRoles = [
          "hospital",
          "doctor",
          "researcher",
          "auditor",
          "insurance",
          "emergency",
        ];
        const destination = providerRoles.includes(result.user?.role)
          ? "/hospital"
          : "/dashboard";
        this.$router.push(destination);
      }
    },
  },
};
</script>

<template>
  <Layout>
    <div>
      <div class="input-container h-100 rounded-3 mb-2">
        <i class="uil uil-users-alt" style="color: white"></i>
        <input
          type="text"
          class="w-100 h-100 pe-3"
          placeholder="Username"
          v-model="username"
          @keyup.enter="login"
        />
      </div>
      <div class="input-container h-100 rounded-3 position-relative">
        <i class="uil uil-lock" style="color: white"></i>
        <Transition name="fade" mode="out-in">
          <input
            :key="showPassword"
            :type="showPassword ? 'text' : 'password'"
            class="w-100 h-100 pe-3"
            placeholder="Password"
            v-model="password"
            @keyup.enter="login"
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
      <div class="input-container h-100 rounded-3 my-2">
        <i class="uil uil-building" style="color: white"></i>
        <select
          class="w-100 h-100 pe-3 bg-transparent border-0 text-white"
          v-model="role"
        >
          <option
            v-for="option in roles"
            :key="option.value"
            :value="option.value"
            class="text-dark"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="row"></div>
      <div class="row">
        <div class="col-6 d-flex mt-2 align-items-center">
          <label class="switch text-start me-2">
            <input
              type="checkbox"
              class="checkbox"
              id="myCheckbox"
              tabindex="0"
              v-model="stayLoggedIn"
              @keydown.enter="
                () => {
                  this.stayLoggedIn = !this.stayLoggedIn;
                }
              "
            />
            <div class="slider frosted"></div>
          </label>
          <span class="fw-bolder">Stay logged in.</span>
        </div>
        <div class="col-6 d-flex align-items-center justify-content-end">
          <div class="d-flex align-items-center">
            <p class="text-center p-0 m-0 pt-2 fw-bold">
              <RouterLink to="/reset">Forgot Password?</RouterLink>
            </p>
          </div>
        </div>
      </div>
      <button
        class="btn btn-primary w-100 mt-2"
        :disabled="!buttonActive"
        @click="login"
      >
        <Transition name="fade" mode="out-in">
          <div :key="buttonActive">
            <span v-if="!buttonActive" class="fw-bolder"
              ><div
                class="spinner-border spinner-border-sm color-primary"
                role="status"
              ></div
            ></span>
            <span v-else class="fw-bolder color-primary">Login</span>
          </div>
        </Transition>
      </button>
      <p class="mt-3 text-center fw-bold">
        Not got an account? Signup
        <RouterLink to="/signup">here</RouterLink>
      </p>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
.checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  transition: ease 100ms;
}

.slider {
  width: 60px;

  height: 30px;
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid transparent;
  transition: 0.3s;
  box-shadow: 0 0 10px 0 rgb(0, 0, 0, 0.25) inset;
  cursor: pointer;
  &::before {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    background-color: #fff;
    transform: translateX(-30px);
    border-radius: 20px;
    transition: 0.3s;
    box-shadow: 0 0 10px 3px rgb(0, 0, 0, 0.25);
  }
}
.checkbox {
  &:focus {
    ~ .slider {
      outline: solid 3px rgba(0, 255, 170, 0.5) !important;
      transition: ease;
    }
  }
  &:checked {
    ~ {
      .slider {
        &::before {
          transform: translateX(30px);
          box-shadow: 0 0 10px 3px rgb(0, 0, 0, 0.25);
        }
        background-color: #00ffaa;
      }
    }
  }
  &:active {
    ~ {
      .slider {
        &::before {
          transform: translate(0);
        }
      }
    }
  }
}
</style>
