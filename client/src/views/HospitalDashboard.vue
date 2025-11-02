<script>
import { getAuth } from "../services/index";
import { getHospitalDashboard } from "../services/hospital";
import Nav from "../components/elements/Nav.vue";

export default {
  components: { Nav },
  data() {
    return {
      patients: [],
      loading: false,
      error: null,
      searchQuery: "",
    };
  },
  computed: {
    filteredPatients() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        return this.patients;
      }
      return this.patients.filter((patient) =>
        (patient.name || "").toLowerCase().includes(query)
      );
    },
  },
  async mounted() {
    await this.bootstrap();
  },
  methods: {
    async bootstrap() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) {
        this.$router.push("/login");
        return;
      }

      const auth = await getAuth(this.$store.state.apiURI, bearer);
      if (auth?.user) {
        this.$store.dispatch("updateUser", auth.user);
        localStorage.setItem("role", auth.user.role);
      }

      const providerRoles = [
        "hospital",
        "doctor",
        "researcher",
        "auditor",
        "insurance",
        "emergency",
      ];

      if (!auth?.success || !providerRoles.includes(auth.user?.role)) {
        this.$router.push("/dashboard");
        return;
      }

      await this.fetchDashboard();
    },
    async fetchDashboard() {
      this.loading = true;
      this.error = null;
      const bearer = localStorage.getItem("bearer");
      try {
        const result = await getHospitalDashboard(this.$store.state.apiURI, bearer);
        if (result.error) {
          throw new Error(result.error);
        }
        this.patients = (result.patients || []).map((patient) => ({
          ...patient,
          open: false,
        }));
      } catch (err) {
        console.error("Hospital dashboard error", err);
        this.error = err.message || "Failed to load dashboard.";
      } finally {
        this.loading = false;
      }
    },
    togglePatient(patient) {
      patient.open = !patient.open;
    },
  },
};
</script>

<template>
  <div class="container py-5 px-sm-5 text-white">
    <Nav />

    <div class="rounded-3 mt-2">
      <Transition name="fade" mode="out-in">
        <div class="rounded-4 frosted p-4 shadow-lg">
          <div class="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <h2 class="fw-bold mb-0">Provider Dashboard</h2>
            <b-button size="sm" variant="outline-light" @click="fetchDashboard" :disabled="loading">
              Refresh
            </b-button>
          </div>
          <div class="mb-4">
            <div class="input-group search-bar">
              <span class="input-group-text bg-transparent border-light text-white-50">
                <i class="uil uil-search"></i>
              </span>
              
              <input
                type="text"
                class="form-control bg-transparent border-light text-white"
                placeholder="Search patients by name..."
                v-model="searchQuery"
              />
            </div>
          </div>

          <div v-if="loading" class="text-center text-white-50 py-5">
            Loading patient folders…
          </div>

          <div v-else-if="error" class="text-danger text-center py-5">
            {{ error }}
          </div>

          <div v-else>
            <p v-if="!patients.length" class="text-white-50">
              No patient folders available yet.
            </p>
            <p v-else-if="!filteredPatients.length" class="text-white-50">
              No patients match your search.
            </p>

            <div
              v-for="patient in filteredPatients"
              :key="patient._id"
              class="mb-3 patient-card"
            >
              <div
                class="patient-card__header"
                role="button"
                @click="togglePatient(patient)"
              >
                <span>
                  📁 {{ patient.name }}
                  <small v-if="patient.email" class="text-white-50">({{ patient.email }})</small>
                </span>
                <span class="text-white-50 small">
                  {{ patient.open ? "Hide" : "View" }}
                </span>
              </div>
              <transition name="fade">
                <div v-if="patient.open" class="patient-card__body">
                    <div
                      v-for="file in patient.records"
                      :key="file._id"
                      class="record-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div class="fw-semibold">{{ file.fileName }}</div>
                        <div class="text-white-50 small">
                          {{ file.recordType || "Record" }} ·
                          {{ file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : "Unknown date" }}
                        </div>
                      </div>
                      <div class="d-flex gap-2">
                        <a
                          class="btn btn-sm btn-outline-light"
                          :href="file.previewUrl || file.downloadUrl"
                          target="_blank"
                          rel="noopener"
                        >
                          Preview
                        </a>
                        <a
                          class="btn btn-sm btn-outline-primary"
                          :href="file.downloadUrl"
                          target="_blank"
                          rel="noopener"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  <div v-if="!patient.records.length" class="text-white-50 small">
                    No records available for this patient.
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.patient-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  overflow: hidden;
}

.patient-card__header {
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.9rem 1.1rem;
}

.patient-card__header:hover {
  background: rgba(255, 255, 255, 0.06);
}

.patient-card__body {
  padding: 0.5rem 1.1rem 1.1rem;
  background: rgba(255, 255, 255, 0.02);
}

.record-item {
  padding: 0.65rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.record-item:last-child {
  border-bottom: none;
}

.search-bar .form-control {
  color: #fff;
}

.search-bar .form-control::placeholder {
  color: rgba(255, 255, 255, 0.55);
}
</style>
