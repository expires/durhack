<script>
import { postCode, putReset } from "../services/index";

import Layout from "../layouts/AuthLayout.vue";

export default {
  components: { Layout },
  data() {
    return {
      email: "",
      password: "",
      inputs: ["", "", "", "", "", ""],
      activeInput: 1,
      codeLoad: false,
      resetLoad: false,
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
    async sendCode() {
      this.codeLoad = true;
      let result = await postCode(this.$store.state.apiURI, this.email);
      this.codeLoad = false;
      this.$store.dispatch("updateNotification", result);
    },
    async reset() {
      const concatenatedNumber = parseInt(this.inputs.join(""), 10);
      this.resetLoad = true;
      let body = {
        email: this.email,
        code: concatenatedNumber,
        password: this.password,
      };
      let result = await putReset(this.$store.state.apiURI, body);
      this.resetLoad = false;
      this.$store.dispatch("updateNotification", result);
      if (result.success) {
        this.$router.push("/login");
      }
    },
    handleKeyDown(index, event) {
      const key = event.key.toLowerCase();
      if (/^\d$/.test(key)) {
        this.inputs[index - 1] = key;
        if (index < 6) {
          this.$refs.inputRefs[index].focus();
        }
      } else if (key === "backspace" && index > 0) {
        this.inputs[index - 1] = "";
        if (index > 1) {
          this.$refs.inputRefs[index - 2].focus();
        }
      } else if (key === "arrowleft" && index > 1) {
        this.$refs.inputRefs[index - 2].focus();
      } else if (
        (key === "arrowright" || key === "enter" || key === "tab") &&
        index < 6
      ) {
        this.$refs.inputRefs[index].focus();
      } else if (key === "tab") {
        this.$refs.pass.focus();
      }
      event.preventDefault();
    },
  },
};
</script>

<template>
  <Layout>
    <div>
      <div class="row mb-2 g-0">
        <div class="col-8">
          <div class="input-container h-100 rounded-start-3">
            <i class="uil uil-at" style="color: white"></i>
            <input
              type="text"
              class="w-100 h-100 pe-3"
              placeholder="Email"
              v-model="email"
            />
          </div>
        </div>
        <div class="col-4" style="cursor: pointer">
          <button
            class="w-100 h-100 sendCode"
            :disabled="codeLoad"
            @click="sendCode"
          >
            <div
              class="w-100 frosted h-100 rounded-end-3 d-flex justify-content-center align-content-center"
            >
              <Transition name="fade" mode="out-in">
                <div :key="codeLoad" class="pt-2">
                  <span v-if="codeLoad" class="fw-bolder"
                    ><div
                      class="spinner-border spinner-border-sm text-light"
                      role="status"
                    ></div
                  ></span>
                  <span v-else class="fw-bolder">Send Code</span>
                </div>
              </Transition>
            </div>
          </button>
        </div>
      </div>
      <div id="inputs" class="row gx-2">
        <div class="col-2" v-for="index in 6">
          <input
            class="input frosted rounded-3 py-2"
            type="text"
            inputmode="numeric"
            maxlength="1"
            v-model="inputs[index - 1]"
            @keydown="handleKeyDown(index, $event)"
            ref="inputRefs"
          />
        </div>
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
      <button
        class="btn btn-primary w-100 mt-2"
        :disabled="resetLoad"
        @click="reset"
      >
        <Transition name="fade" mode="out-in">
          <div :key="resetLoad" class="">
            <span v-if="resetLoad" class="fw-bolder"
              ><div
                class="spinner-border spinner-border-sm color-primary"
                role="status"
              ></div
            ></span>
            <span v-else class="fw-bolder color-primary">Reset Password</span>
          </div>
        </Transition>
      </button>
    </div></Layout
  >
</template>

<style lang="scss" scoped>
.sendCode {
  all: initial;
  cursor: pointer;
  transition: ease 200ms;
  &:disabled {
    cursor: auto !important;
  }
  &:focus {
    box-shadow: none !important;
    opacity: 0.5;
  }
}
.sendCode[disabled] {
  cursor: auto !important;
}
.input {
  text-align: center;
  cursor: pointer;
  caret-color: transparent;
  &:focus {
    border: solid 3px rgba(0, 255, 170, 0.5);
  }
}
</style>
