<script>
import { getAuth, postUpload } from "../services/index";
import Nav from "../components/elements/Nav.vue";

export default {
  components: { Nav },
  data() {
    return {
      users: [],
      activeNum: 0,
      records: [],
      uploading: false,
    };
  },
  async mounted() {
    this.$store.dispatch("updateUsers", this.users);
    const bearer = localStorage.getItem("bearer");
    if (bearer?.length) {
      const auth = await getAuth(this.$store.state.apiURI, bearer);
      if (!auth.success) localStorage.setItem("bearer", "");
    }
  },
  methods: {
    setActive(num) {
      this.activeNum = num;
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
      console.log("📄 Selected file:", file.name);

      // Add a temporary pending record while uploading
      const tempRecord = {
        fileName: file.name,
        type: "Uploaded File",
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

        // Replace the temp record with the actual one from backend
        this.records[0] = {
          fileName: result.fileName || file.name,
          type: result.recordType || "Health Record",
          verified: true,
          solanaTx: result.solanaTx || "unknown",
          uploadedAt: new Date().toISOString().split("T")[0],
        };

        console.log("✅ File uploaded successfully:", result);
      } catch (err) {
        console.error("❌ Upload failed:", err);
        alert("Upload failed: " + err.message);
        this.records.shift(); // remove temp record
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>


<template>
  <div class="container py-5 px-sm-5 text-white">
    <Nav />

    <div class="rounded-3 mt-4">
      <Transition name="fade" mode="out-in">
        <div class="rounded-3 frosted p-4 shadow-lg">

          <!-- Header -->
          <div class="mb-5">
            <h2 class="fw-bold">Dashboard</h2>
          </div>

          <!-- Records Section -->
          <div class="p-3 rounded-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-uppercase text-white-50">Health Records</h5>

              <!-- Hidden file input -->
              <input
                  ref="fileInput"
                  type="file"
                  accept=".pdf,.jpg,.png,.txt"
                  class="d-none"
                  @change="handleFileSelect"
              />

              <!-- Upload button -->
              <button
                  class="btn btn-primary btn-sm px-3"
                  @click="$refs.fileInput.click()"
              >
                + Upload New
              </button>
            </div>

            <div
                v-for="(record, i) in records"
                :key="i"
                class="record-item p-3 mb-3 rounded-3 frosted-inner"
            >
              <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center">
                <div>
                  <h6 class="mb-1 fw-semibold">{{ record.fileName }}</h6>
                  <p class="mb-0 text-white-50 small">{{ record.type }} · {{ record.uploadedAt }}</p>
                </div>
                <div class="text-sm-end mt-3 mt-sm-0">
                  <a
                      v-if="record.solanaTx !== 'pending...'"
                      :href="`https://explorer.solana.com/tx/${record.solanaTx}?cluster=devnet`"
                      target="_blank"
                      class="text-decoration-none text-info small"
                  >
                    {{ record.solanaTx.slice(0, 8) }}...
                  </a>
                  <span v-else class="text-white-50 small">pending...</span>
                  <div
                      class="badge ms-2"
                      :class="record.verified ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ record.verified ? "Verified" : "Pending" }}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
}

.frosted-inner {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: 0.2s;
}

.frosted-inner:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.btn-outline-light {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}
.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.15);
}

h2,
h5,
h6 {
  color: #fff;
}
</style>
