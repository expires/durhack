<script>
import {
  getAuth,
  postUpload,
  getFiles,
  getVerify,
} from "../services/index";
import { createConsent, getConsents, revokeConsent } from "../services/consents";
import Nav from "../components/elements/Nav.vue";

export default {
  components: { Nav },
  data() {
    return {
      users: [],
      activeNum: 0,
      records: [],
      uploading: false,
      verifyingId: null,
      consents: [],
      loadingConsents: false,
      showConsentForm: false,
      consentSubmitting: false,
      newConsent: {
        providerId: "",
        scopes: "records.read",
        purpose: "care",
        expiresAt: "",
      },
    };
  },
  async mounted() {
    this.$store.dispatch("updateUsers", this.users);
    const bearer = localStorage.getItem("bearer");
    if (!bearer?.length) return;

    const auth = await getAuth(this.$store.state.apiURI, bearer);
    if (!auth.success) {
      localStorage.setItem("bearer", "");
      return;
    }

    await this.fetchRecords();
    await this.fetchConsents();
  },
  methods: {
    setActive(num) {
      this.activeNum = num;
    },
    formatDate(value) {
      if (!value) return "—";
      return new Date(value).toLocaleDateString();
    },
    async fetchRecords() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return;

      try {
        const result = await getFiles(this.$store.state.apiURI, bearer);
        if (result.records && Array.isArray(result.records)) {
          this.records = result.records.map((r) => ({
            id: r.id || r._id,
            fileName: r.fileName,
            recordType: r.recordType || "Health Record",
            solanaTx: r.solanaTx,
            hash: r.hash,
            uploadedAt: r.uploadedAt || r.timestamp,
            downloadUrl: r.downloadUrl,
            verified: r.verified ?? true,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch records:", err);
      }
    },
    async fetchConsents() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return;
      this.loadingConsents = true;
      try {
        const result = await getConsents(this.$store.state.apiURI, bearer);
        this.consents = result.consents || [];
      } catch (err) {
        console.error("Failed to fetch consents:", err);
      } finally {
        this.loadingConsents = false;
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
        id: `temp-${Date.now()}`,
        fileName: file.name,
        recordType: "Uploaded File",
        verified: false,
        solanaTx: "pending...",
        uploadedAt: new Date().toISOString().split("T")[0],
      };
      this.records.unshift(tempRecord);

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
        this.records = this.records.filter((r) => r.id !== tempRecord.id);
      } finally {
        this.uploading = false;
      }
    },
    async verifyRecord(record) {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) {
        alert("You must be logged in to verify records.");
        return;
      }
      this.verifyingId = record.id;
      try {
        const result = await getVerify(
          this.$store.state.apiURI,
          bearer,
          record.id
        );
        if (result.error) throw new Error(result.error);
        record.verified = result.verified;
        record.verificationDetails = result.details;
        alert(
          result.verified
            ? "✅ Verified: file matches Solana and GCS"
            : "⚠️ Verification failed. Hash mismatch."
        );
      } catch (err) {
        console.error("Verification failed:", err);
        alert("Verification failed: " + err.message);
      } finally {
        this.verifyingId = null;
      }
    },
    async handleCreateConsent() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return alert("Please log in first.");
      if (!this.newConsent.providerId || !this.newConsent.scopes) {
        return alert("Provider ID and scopes are required.");
      }
      this.consentSubmitting = true;
      try {
        const data = {
          providerId: this.newConsent.providerId,
          scopes: this.newConsent.scopes
            .split(",")
            .map((scope) => scope.trim())
            .filter(Boolean),
          purpose: this.newConsent.purpose,
          expiresAt: this.newConsent.expiresAt || null,
        };
        const result = await createConsent(
          this.$store.state.apiURI,
          bearer,
          data
        );
        if (result.success) {
          this.showConsentForm = false;
          this.newConsent = {
            providerId: "",
            scopes: "records.read",
            purpose: "care",
            expiresAt: "",
          };
          await this.fetchConsents();
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
        } else {
          alert(result.error || "Failed to revoke consent");
        }
      } catch (err) {
        console.error("Error revoking consent:", err);
      }
    },
  },
};
</script>

<template>
  <div class="container py-5 px-sm-5 text-white">
    <Nav />

    <div class="py-5">
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
            Records
          </div>
          <div
            class="col-4 text-center fw-bold p-2 rounded-3 btn-nav"
            @click="setActive(1)"
          >
            Consents
          </div>
          <div
            class="col-4 text-center fw-bold p-2 rounded-3 btn-nav"
            @click="setActive(2)"
          >
            Activity
          </div>
        </div>
      </div>

      <div class="rounded-3 mt-3">
        <Transition name="fade" mode="out-in">
          <div class="rounded-3 text-start frosted p-4" :key="activeNum">
            <div v-if="activeNum === 0">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Health Records</h4>
                <div class="d-flex align-items-center gap-2">
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".pdf,.jpg,.png,.txt"
                    class="d-none"
                    @change="handleFileSelect"
                  />
                  <button
                    class="btn btn-primary btn-sm px-3"
                    :disabled="uploading"
                    @click="$refs.fileInput.click()"
                  >
                    <span v-if="uploading">Uploading…</span>
                    <span v-else>+ Upload New</span>
                  </button>
                </div>
              </div>

              <div v-if="!records.length" class="text-center text-muted py-4">
                No records yet. Upload your first document.
              </div>

              <div
                v-for="record in records"
                :key="record.id"
                class="record-item p-3 mb-3 rounded-3 frosted-inner"
              >
                <div class="row g-3 align-items-start">
                  <div class="col-12 col-md-6">
                    <h6 class="mb-1 fw-semibold">{{ record.fileName }}</h6>
                    <p class="mb-1 text-muted">
                      {{ record.recordType }} · {{ formatDate(record.uploadedAt) }}
                    </p>
                    <div class="d-flex gap-2 flex-wrap">
                      <a
                        v-if="record.downloadUrl"
                        :href="record.downloadUrl"
                        target="_blank"
                        class="btn btn-primary btn-sm"
                      >
                        Download
                      </a>
                      <button
                        class="btn btn-primary btn-sm"
                        :disabled="verifyingId === record.id"
                        @click="verifyRecord(record)"
                      >
                        <span v-if="verifyingId === record.id">Verifying…</span>
                        <span v-else>Verify</span>
                      </button>
                      <a
                        v-if="record.solanaTx && record.solanaTx !== 'pending...'"
                        :href="`https://explorer.solana.com/tx/${record.solanaTx}?cluster=devnet`"
                        target="_blank"
                        class="btn btn-primary btn-sm"
                      >
                        Solana TX
                      </a>
                    </div>
                  </div>
                  <div class="col-12 col-md-6 text-md-end">
                    <div>
                      <span
                        class="badge px-3 py-2"
                        :class="record.verified ? 'bg-success' : 'bg-secondary'"
                      >
                        {{ record.verified ? "Verified" : "Unverified" }}
                      </span>
                    </div>
                    <p class="mt-2 text-muted small">
                      Hash: {{ record.hash ? record.hash.slice(0, 16) + "…" : "—" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeNum === 1">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Provider Consents</h4>
                <button
                  class="btn btn-primary btn-sm px-3"
                  @click="showConsentForm = !showConsentForm"
                >
                  {{ showConsentForm ? "Close" : "New Consent" }}
                </button>
              </div>

              <div v-if="showConsentForm" class="frosted-inner p-3 mb-3 rounded-3">
                <div class="row g-2">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Provider ID</label>
                    <input
                      v-model="newConsent.providerId"
                      type="text"
                      class="w-100 input-container"
                      placeholder="Provider ObjectId"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Scopes (comma separated)</label>
                    <input
                      v-model="newConsent.scopes"
                      type="text"
                      class="w-100 input-container"
                      placeholder="records.read, labs.read"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Purpose</label>
                    <input
                      v-model="newConsent.purpose"
                      type="text"
                      class="w-100 input-container"
                      placeholder="care"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Expires At (optional)</label>
                    <input
                      v-model="newConsent.expiresAt"
                      type="date"
                      class="w-100 input-container"
                    />
                  </div>
                </div>
                <div class="text-end mt-3">
                  <button
                    class="btn btn-primary"
                    :disabled="consentSubmitting"
                    @click="handleCreateConsent"
                  >
                    <span v-if="consentSubmitting">Creating…</span>
                    <span v-else>Create Consent</span>
                  </button>
                </div>
              </div>

              <div v-if="loadingConsents" class="text-center text-muted py-4">
                Loading consents…
              </div>

              <div v-else-if="!consents.length" class="text-center text-muted py-4">
                No consents created yet.
              </div>

              <div
                v-else
                class="frosted-inner p-3 rounded-3"
              >
                <div
                  v-for="consent in consents"
                  :key="consent.consentId"
                  class="border-bottom pb-3 mb-3"
                >
                  <div class="d-flex justify-content-between flex-wrap gap-2">
                    <div>
                      <h6 class="mb-1">Consent {{ consent.consentId }}</h6>
                      <p class="mb-1 text-muted small">
                        Provider: {{ consent.providerId }} · Scopes:
                        {{ consent.scopes?.join(", ") || "—" }}
                      </p>
                      <p class="mb-1 text-muted small">
                        Purpose: {{ consent.purpose || "care" }}
                      </p>
                      <p class="mb-1 text-muted small">
                        Expires: {{ formatDate(consent.expiresAt) }}
                      </p>
                      <p class="mb-1 text-muted small">
                        Status:
                        <span v-if="consent.revokedAt">Revoked</span>
                        <span v-else-if="consent.expiresAt && new Date(consent.expiresAt) < new Date()">Expired</span>
                        <span v-else>Active</span>
                      </p>
                    </div>
                    <div class="text-end">
                      <a
                        v-if="consent.solanaTx"
                        :href="`https://explorer.solana.com/tx/${consent.solanaTx}?cluster=devnet`"
                        target="_blank"
                        class="btn btn-primary btn-sm mb-2"
                      >
                        Solana Receipt
                      </a>
                      <div>
                        <button
                          class="btn btn-primary btn-sm"
                          :disabled="!!consent.revokedAt"
                          @click="handleRevokeConsent(consent.consentId)"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else>
              <div class="text-center text-muted py-4">
                Activity logs coming soon.
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.frosted-inner {
  background: rgba(255, 255, 255, 0.05);
  border: solid 3px rgba(127, 124, 124, 0.12);
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: rgba(255, 255, 255, 0.75);
}
</style>
