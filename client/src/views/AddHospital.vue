<script>
import { addHospital } from "../services/index";

export default {
  name: "AddHospital",
  data() {
    return {
      email: "",
      username: "",
      name: "",
      password: "",
      adminPassword: "",
      role: "hospital",
      roles: [
        { label: "Hospital", value: "hospital" },
        { label: "Doctor", value: "doctor" },
        { label: "Researcher", value: "researcher" },
        { label: "Auditor / Compliance", value: "auditor" },
        { label: "Insurance / Billing", value: "insurance" },
        { label: "Emergency Responder", value: "emergency" },
      ],
      loading: false,
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async submit() {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        if (
          !this.email ||
          !this.username ||
          !this.name ||
          !this.password ||
          !this.adminPassword
        ) {
          throw new Error("All fields are required.");
        }
        const body = {
          email: this.email,
          username: this.username,
          name: this.name,
          password: this.password,
          adminPassword: this.adminPassword,
          role: this.role,
        };

        const result = await addHospital(this.$store.state.apiURI, body);

        if (result.error) {
          throw new Error(result.error);
        }

        this.successMessage = `Created ${this.role} account successfully.`;
        this.email = "";
        this.username = "";
        this.name = "";
        this.password = "";
        this.adminPassword = "";
        this.role = "hospital";
      } catch (err) {
        this.errorMessage = err.message || "Failed to create hospital.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div class="container py-5 text-white">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="frosted p-4 rounded-4 shadow">
          <h2 class="fw-bold mb-4 text-center">Admin: Create Provider Account</h2>
          <p class="text-white-50 small text-center mb-4">
            Enter the admin password and hospital details to create a new provider account.
          </p>

          <form @submit.prevent="submit" class="d-grid gap-3">
            <div>
              <label class="form-label text-white-50">Admin Password</label>
              <input
                type="password"
                class="form-control bg-transparent text-white border-light"
                v-model="adminPassword"
                required
              />
            </div>
            <div>
              <label class="form-label text-white-50">Provider Type</label>
              <select
                class="form-select bg-transparent text-white border-light"
                v-model="role"
                required
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
            <div>
              <label class="form-label text-white-50">Provider Name</label>
              <input
                type="text"
                class="form-control bg-transparent text-white border-light"
                v-model="name"
                required
              />
            </div>
            <div>
              <label class="form-label text-white-50">Email</label>
              <input
                type="email"
                class="form-control bg-transparent text-white border-light"
                v-model="email"
                required
              />
            </div>
            <div>
              <label class="form-label text-white-50">Username</label>
              <input
                type="text"
                class="form-control bg-transparent text-white border-light"
                v-model="username"
                required
              />
            </div>
            <div>
              <label class="form-label text-white-50">Password</label>
              <input
                type="password"
                class="form-control bg-transparent text-white border-light"
                v-model="password"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary mt-2 "
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm"></span>
              <span class="text-primary" style="color: #00ffaa!important;" v-else>Create Provider Account</span>
            </button>

            <p v-if="successMessage" class="text-success small mb-0">{{ successMessage }}</p>
            <p v-if="errorMessage" class="text-danger small mb-0">{{ errorMessage }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.frosted {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
