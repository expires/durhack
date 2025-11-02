<script>
import { getAuth, postUpload, getFiles, updateProfile } from "../services/index";
import { createConsent, getConsents, revokeConsent } from "../services/consents";
import { getProviders } from "../services/hospital";
import Nav from "../components/elements/Nav.vue";
import PatientTimeline from "../components/PatientTimeline.vue";

export default {
  components: { Nav, PatientTimeline },
  data() {
    return {
      records: [],
      filteredRecords: [],
      uploading: false,
      searchQuery: "",
      consents: [],
      loadingConsents: false,
      showConsentForm: false,
      consentSubmitting: false,
      newConsent: {
        providerId: "",
        expiresAt: "",
      },
      selectedRecordIds: [],
      providers: [],
      profileForm: {
        name: "",
        dateOfBirth: "",
        address: "",
      },
      profileSaving: false,
      profileError: null,
    };
  },
  computed: {
    user() {
      return this.$store.state.user || {};
    },
    userRole() {
      return this.$store.state.user?.role || localStorage.getItem("role");
    },
    allRecordsSelected() {
      return (
        this.records.length > 0 &&
        this.selectedRecordIds.length === this.records.length
      );
    },
    needsProfile() {
      if (this.userRole !== "patient") return false;
      const u = this.user;
      return !(u?.name && u?.dateOfBirth && u?.address);
    },
    userAge() {
      if (!this.user?.dateOfBirth) return null;
      const dob = new Date(this.user.dateOfBirth);
      if (Number.isNaN(dob.getTime())) return null;
      const diff = Date.now() - dob.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    },
  },
  watch: {
    user: {
      handler(newVal, oldVal) {
        if (newVal) {
          this.syncProfileForm(newVal);
        }
      },
      deep: false,
    },
  },
  async mounted() {
    await this.bootstrap();
  },
  methods: {
    syncProfileForm(user = this.user) {
      if (!user) return;
      this.profileForm = {
        name: user.name || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: user.address || "",
      };
    },
    async bootstrap() {
      const bearer = localStorage.getItem("bearer");
      if (!(bearer?.length)) {
        this.$router.push("/login");
        return;
      }

      const auth = await getAuth(this.$store.state.apiURI, bearer);
      if (auth?.user) {
        this.$store.dispatch("updateUser", auth.user);
        localStorage.setItem("role", auth.user.role);
        if (auth.user.role === "patient") {
          this.syncProfileForm(auth.user);
        }
      }

      if (!auth?.success || (auth.user && auth.user.role !== "patient")) {
        this.$router.push("/hospital");
        return;
      }

      await this.fetchRecords();
      await this.fetchConsents();
      await this.fetchProviders();
    },
    filterRecords() {
      const query = this.searchQuery.toLowerCase();
      this.filteredRecords = this.records.filter((r) =>
        r.fileName.toLowerCase().includes(query)
      );
    },
    async fetchRecords() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return;

      const result = await getFiles(this.$store.state.apiURI, bearer);
      if (result.records && Array.isArray(result.records)) {
        this.records = result.records.map((r) => ({
          _id: r._id,
          fileName: r.fileName,
          type: r.recordType || "Health Record",
          verified: r.verified ?? false,
          solanaTx: r.solanaTx,
          uploadedAt: new Date(r.uploadedAt).toISOString().split("T")[0],
          downloadUrl: r.downloadUrl,
        }));
        this.filteredRecords = [...this.records];
        this.selectedRecordIds = this.selectedRecordIds.filter((id) =>
          this.records.some((record) => record._id === id)
        );
      }
    },
    async saveProfile() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return;
      this.profileSaving = true;
      this.profileError = null;
      try {
        const payload = {
          name: this.profileForm.name,
          dateOfBirth: this.profileForm.dateOfBirth,
          address: this.profileForm.address,
        };

        const result = await updateProfile(
          this.$store.state.apiURI,
          bearer,
          payload
        );

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.user) {
          this.$store.dispatch("updateUser", result.user);
          this.syncProfileForm(result.user);
        }
      } catch (err) {
        console.error("Profile update failed:", err);
        this.profileError = err.message || "Failed to save profile.";
      } finally {
        this.profileSaving = false;
      }
    },
    async fetchConsents() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return;
      this.loadingConsents = true;
      try {
        const result = await getConsents(this.$store.state.apiURI, bearer);
        this.consents = (result.consents || []).filter(
          (consent) => !consent.revokedAt
        );
      } catch (err) {
        console.error("Failed to fetch consents:", err);
      } finally {
        this.loadingConsents = false;
      }
    },
    async fetchProviders() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return;
      try {
        const result = await getProviders(this.$store.state.apiURI, bearer);
        this.providers = result.providers || [];
      } catch (err) {
        console.error("Failed to fetch providers:", err);
      }
    },
    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      const bearer = localStorage.getItem("bearer");
      if (!bearer) {
        alert("You must be logged in to upload files.");
        return;
      }

      this.uploading = true;
      const tempRecord = {
        _id: `temp-${Date.now()}`,
        fileName: file.name,
        type: "Uploaded File",
        verified: false,
        solanaTx: "pending...",
        uploadedAt: new Date().toISOString().split("T")[0],
      };
      this.records.unshift(tempRecord);
      this.filteredRecords = [...this.records];

      try {
        const recordType = "General Record";
        const timestamp = new Date().toISOString();

        const result = await postUpload(
          this.$store.state.apiURI,
          bearer,
          file,
          recordType,
          timestamp
        );
        if (result.error) throw new Error(result.error);

        await this.fetchRecords();
      } catch (err) {
        console.error("❌ Upload failed:", err);
        alert("Upload failed: " + err.message);
        this.records = this.records.filter((r) => r._id !== tempRecord._id);
        this.filteredRecords = [...this.records];
      } finally {
        this.uploading = false;
      }
    },
    toggleSelectAllRecords() {
      if (this.allRecordsSelected) {
        this.selectedRecordIds = [];
      } else {
        this.selectedRecordIds = this.records.map((record) => record._id);
      }
    },
    async handleCreateConsent() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return alert("Please log in first.");

      if (!this.newConsent.providerId) {
        return alert("Provider selection is required.");
      }

      const providerExists = this.providers.some(
        (provider) => provider.id === this.newConsent.providerId
      );
      if (!providerExists) {
        return alert("Selected provider could not be found.");
      }

      if (!this.selectedRecordIds.length) {
        return alert("Select at least one record to authorize.");
      }

      this.consentSubmitting = true;
      try {
        const payload = {
          providerId: this.newConsent.providerId,
          recordIds: this.selectedRecordIds,
          expiresAt: this.newConsent.expiresAt || null,
        };

        const result = await createConsent(
          this.$store.state.apiURI,
          bearer,
          payload
        );

        if (result.success) {
          this.showConsentForm = false;
          this.newConsent = {
            providerId: "",
            purpose: "care",
            expiresAt: "",
          };
          this.selectedRecordIds = [];
          await this.fetchConsents();
          this.$refs.timeline?.fetchTimeline();
        } else {
          alert(result.error || "Failed to create consent");
        }
      } catch (err) {
        console.error("Error creating consent:", err);
        alert("Failed to create consent");
      } finally {
        this.consentSubmitting = false;
      }
    },
    async handleRevokeConsent(consentId) {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return alert("Please log in first.");

      try {
        const result = await revokeConsent(
          this.$store.state.apiURI,
          bearer,
          consentId
        );
        if (result.success) {
          await this.fetchConsents();
          this.$refs.timeline?.fetchTimeline();
        } else {
          alert(result.error || "Failed to revoke consent");
        }
      } catch (err) {
        console.error("Error revoking consent:", err);
      }
    },
    consentStatus(consent) {
      if (consent.revokedAt) {
        return { label: "Revoked", variant: "bg-danger" };
      }
      if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) {
        return { label: "Expired", variant: "bg-warning" };
      }
      return { label: "Active", variant: "bg-success" };
    },
    consentStatusLabel(consent) {
      return this.consentStatus(consent).label;
    },
    consentStatusVariant(consent) {
      return this.consentStatus(consent).variant;
    },
    purposeLabel(value) {
      const map = {
        care: "Direct Care / Treatment",
        research: "Research & Studies",
        audit: "Audit & Compliance",
        billing: "Billing & Insurance",
        referral: "Referral / Consultation",
        emergency: "Emergency Access",
        data_portability: "Data Portability",
        legal: "Legal / Forensics",
      };
      return map[value] || value || "care";
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
          <!-- Header -->
          <div class="mb-5 d-flex justify-content-between align-items-center">
            <h2 class="fw-bold mb-0">Dashboard</h2>
            <button
                v-if="uploading"
                class="btn btn-outline-light btn-sm px-3"
                disabled
            >
              Uploading...
            </button>
          </div>

          <div v-if="userRole === 'patient'" class="p-3 mb-4 rounded-3">
            <div v-if="needsProfile">
              <h5 class="text-uppercase text-white-50 mb-2">Complete Your Profile</h5>
              <p class="text-white-50 small">
                We need a few more details to personalize your dashboard.
              </p>
              <form @submit.prevent="saveProfile" class="row g-3">
                <div class="col-12 col-md-4">
                  <label class="form-label">Full Name</label>
                  <div class="input-container rounded-3">
                    <input
                      type="text"
                      class="w-100 h-100 pe-3"
                      v-model="profileForm.name"
                      required
                    />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label">Date of Birth</label>
                  <div class="input-container rounded-3">
                    <input
                      type="date"
                      class="w-100 h-100 pe-3"
                      v-model="profileForm.dateOfBirth"
                      required
                    />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label">Home Address</label>
                  <div class="input-container rounded-3">
                    <input
                      type="text"
                      class="w-100 h-100 pe-3"
                      v-model="profileForm.address"
                      required
                    />
                  </div>
                </div>
                <div class="col-12 d-flex justify-content-end align-items-center gap-3">
                  <span v-if="profileError" class="text-danger small">{{ profileError }}</span>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="profileSaving"
                  >
                    <span v-if="profileSaving" class="spinner-border spinner-border-sm"></span>
                    <span v-else style="color:#00ffaa !important;">Save Details</span>
                  </button>
                </div>
              </form>
            </div>
            <div v-else>
              <h5 class="text-uppercase text-white-50 mb-3">Patient Overview</h5>
              <div class="table-responsive">
                <table class="table table-borderless align-middle text-white">
                  <thead>
                  <tr class="text-uppercase text-white-50 small">
                    <th scope="col">Full Name</th>
                    <th scope="col">Age</th>
                    <th scope="col">Home Address</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td class="fw-semibold">{{ user.name || "—" }}</td>
                    <td class="text-white-50">
                      {{ userAge !== null ? userAge + " years" : "—" }}
                    </td>
                    <td class="text-white-50">{{ user.address || "—" }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- Records Section -->
          <div class="p-3 rounded-3">
            <div
                class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-3"
            >
              <h5 class="text-uppercase text-white-50 mb-0">
                Health Records
              </h5>

              <!-- File Upload -->
              <input
                  ref="fileInput"
                  type="file"
                  accept=".pdf,.jpg,.png,.txt"
                  class="d-none"
                  @change="handleFileSelect"
              />
              <button
                  class="btn btn-primary btn-sm px-3"
                  @click="$refs.fileInput.click()"
              >
                + Upload New
              </button>
            </div>

            <!-- Search bar -->
            <input
                type="text"
                class="form-control frosted-sub text-white mb-4"
                placeholder="Search records..."
                v-model="searchQuery"
                @input="filterRecords"
            />

            <!-- Table -->
            <div v-if="filteredRecords.length" class="table-responsive">
              <table class="table table-borderless align-middle text-white">
                <thead>
                <tr class="text-uppercase text-white-50 small">
                  <th scope="col">File Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Date Uploaded</th>
                  <th scope="col">Status</th>
                  <th scope="col">Solana TX</th>
                  <th scope="col" class="text-end">Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr
                    v-for="(record, i) in filteredRecords"
                    :key="i"
                    class="frosted-inner rounded-3"
                >
                  <td class="fw-semibold">{{ record.fileName }}</td>
                  <td class="text-white-50">{{ record.type }}</td>
                  <td class="text-white-50">{{ record.uploadedAt }}</td>
                  <td>
                      <span
                          class="badge"
                          :class="record.verified ? 'bg-success' : 'bg-danger'"
                      >
                        {{ record.verified ? "Verified" : "Tampered" }}
                      </span>
                  </td>
                  <td>
                    <a
                        v-if="record.solanaTx && record.solanaTx !== 'pending...'"
                        :href="`https://explorer.solana.com/tx/${record.solanaTx}?cluster=devnet`"
                        target="_blank"
                        rel="noopener"
                        class="text-info text-decoration-none small"
                    >
                      {{ record.solanaTx.slice(0, 8) }}...
                    </a>
                    <span v-else class="text-white-50 small">Pending...</span>
                  </td>
                  <td class="text-end">
                    <div class="d-flex gap-2 justify-content-end">
                      <a
                          v-if="record.downloadUrl"
                          :href="record.downloadUrl"
                          target="_blank"
                          class="btn btn-outline-light btn-sm"
                      >
                        Download
                      </a>
                      <a
                          v-if="record.previewUrl"
                          :href="record.previewUrl"
                          target="_blank"
                          rel="noopener"
                          class="btn btn-outline-light btn-sm"
                      >
                        Preview
                      </a>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="text-center text-white-50 py-5">
              <p>No records found matching "{{ searchQuery }}".</p>
            </div>
          </div>

          <!-- Consent Management -->
          <div class="p-3 rounded-3 mt-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
              <h5 class="text-uppercase text-white-50 mb-0">Provider Authorizations</h5>
              <button
                class="btn btn-primary btn-sm px-3"
                @click="showConsentForm = !showConsentForm"
              >
                {{ showConsentForm ? "Close" : "Authorize Provider" }}
              </button>
            </div>

            <div v-if="showConsentForm" class="frosted-sub p-3 rounded-3 mb-3">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Select Provider</label>
                  <div class="input-container">
                    <select
                      class="w-100 h-100 pe-3 bg-transparent border-0 text-white"
                      v-model="newConsent.providerId"
                    >
                      <option disabled value="" class="text-dark">
                        {{ providers.length ? "Select a provider" : "No providers available" }}
                      </option>
                      <option
                        v-for="provider in providers"
                        :key="provider.id"
                        :value="provider.id"
                        class="text-dark"
                      >
                        {{ provider.username }}
                        <span v-if="provider.email"> ({{ provider.email }})</span>
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Expires At (optional)</label>
                  <div class="input-container">
                    <input
                      v-model="newConsent.expiresAt"
                      type="date"
                      class="w-100 h-100 pe-3"
                    />
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label d-flex justify-content-between align-items-center">
                    <span>Select Records to Authorize</span>
                    <button
                      class="btn btn-outline-light btn-sm"
                      type="button"
                      @click="toggleSelectAllRecords"
                    >
                      {{ allRecordsSelected ? "Clear" : "Select All" }}
                    </button>
                  </label>
                  <div class="record-select border rounded-3 p-3">
                    <p v-if="!records.length" class="text-white-50 mb-0">
                      Upload records to authorize them for providers.
                    </p>
                    <div v-else class="record-list">
                      <label
                        v-for="record in records"
                        :key="record._id"
                        class="d-flex align-items-center mb-2"
                      >
                        <input
                          type="checkbox"
                          class="form-check-input me-2"
                          :value="record._id"
                          v-model="selectedRecordIds"
                        />
                        <span>{{ record.fileName }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-end mt-3">
                <button
                  class="btn btn-primary btn-sm px-4"
                  :disabled="consentSubmitting"
                  @click="handleCreateConsent"
                >
                  <span v-if="consentSubmitting">Authorizing…</span>
                  <span v-else>Authorize Provider</span>
                </button>
              </div>
            </div>

            <div v-if="loadingConsents" class="text-center text-white-50 py-4">
              Loading provider authorizations…
            </div>
            <div v-else-if="!consents.length" class="text-white-50 py-4">
              No provider authorizations yet.
            </div>
            <div v-else class="table-responsive">
              <table class="table table-borderless align-middle text-white">
                <thead>
                  <tr class="text-uppercase text-white-50 small">
                    <th scope="col">Provider</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Records</th>
                    <th scope="col">Status</th>
                    <th scope="col">Receipt</th>
                    <th scope="col" class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="consent in consents"
                    :key="consent.consentId"
                    class="frosted-inner"
                  >
                    <td>
                      <div class="fw-semibold">
                        {{ consent.provider?.username || "Unknown Provider" }}
                      </div>
                      <div class="text-white-50 small">
                        {{ consent.provider?.email || "No email" }}
                      </div>
                    </td>
                    <td class="text-white-50">{{ purposeLabel(consent.purpose) }}</td>
                    <td class="text-white-50">
                      <ul class="list-unstyled mb-0">
                        <li v-for="record in consent.records" :key="record.id">
                          {{ record.fileName }}
                        </li>
                      </ul>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="consentStatusVariant(consent)"
                      >
                        {{ consentStatusLabel(consent) }}
                      </span>
                      <div class="text-white-50 small mt-1">
                        Expires: {{ consent.expiresAt ? (new Date(consent.expiresAt)).toLocaleDateString() : "—" }}
                      </div>
                    </td>
                    <td>
                      <a
                        v-if="consent.solanaTx"
                        :href="`https://explorer.solana.com/tx/${consent.solanaTx}?cluster=devnet`"
                        target="_blank"
                        class="text-info text-decoration-none small"
                      >
                        View TX
                      </a>
                      <span v-else class="text-white-50 small">—</span>
                    </td>
                    <td class="text-end">
                      <button
                        class="btn btn-outline-light btn-sm"
                        :disabled="!!consent.revokedAt"
                        @click="handleRevokeConsent(consent.consentId)"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <PatientTimeline ref="timeline" class="mt-4" />

          <!-- Footer -->
          <div class="text-center mt-5 text-white-50 small">
            © 2025 BridgeHealth · Secure · Verified · Decentralized
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
