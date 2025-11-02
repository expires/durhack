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
    canUploadForPatients() {
      const role = this.$store.state.user?.role || localStorage.getItem("role");
      return ["hospital", "doctor"].includes(role);
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
          uploading: false,
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
    async promptUpload(patient) {
      if (!this.canUploadForPatients || patient.uploading) return;

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "*/*";

      input.onchange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const bearer = localStorage.getItem("bearer");
        if (!bearer) {
          this.$router.push("/login");
          return;
        }

        patient.uploading = true;
        try {
          const recordType = "Provider Uploaded Record";
          const timestamp = new Date().toISOString();
          const result = await postUpload(
            this.$store.state.apiURI,
            bearer,
            file,
            recordType,
            timestamp,
            patient._id
          );
          if (result.error) {
            throw new Error(result.error);
          }
          await this.fetchDashboard();
        } catch (err) {
          console.error("Provider upload failed:", err);
          this.$store.dispatch("updateNotification", {
            error: err.message || "Failed to upload record.",
          });
        } finally {
          patient.uploading = false;
          input.value = "";
        }
      };

      input.click();
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
                class="form-control frosted-sub text-white mb-4"
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
              <div
                v-if="canUploadForPatients"
                class="patient-card__actions"
              >
                <button
                  class="btn btn-sm btn-outline-success"
                  :disabled="patient.uploading"
                  @click.stop="promptUpload(patient)"
                >
                  <span v-if="patient.uploading">
                    Uploading…
                  </span>
                  <span v-else>
                    Upload Record
                  </span>
                </button>
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

.patient-card__actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 1.1rem 0.25rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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

.frosted {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  color: #fff;
}

.frosted-sub {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  padding: 0.35rem 0.75rem;
  color: #fff;
}

.table {
  color: #fff;
}
.table thead tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.table tbody tr {
  transition: background 0.2s ease;
}
.table tbody tr:hover {
  background: rgba(255, 255, 255, 0.08);
}
.badge {
  font-size: 0.75rem;
  padding: 0.4em 0.6em;
  border-radius: 0.5rem;
}

.btn-outline-light {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}
.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.15);
}

input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-select {
  background: rgba(255, 255, 255, 0.03);
}
.record-select label {
  cursor: pointer;
}
.record-select input[type="checkbox"] {
  cursor: pointer;
}

.overview-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 1rem;
  min-height: 92px;
}
</style>
