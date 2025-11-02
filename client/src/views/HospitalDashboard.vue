<script>
import { getAuth } from "../services/index";
import { getHospitalPatients } from "../services/hospital";
import Nav from "../components/elements/Nav.vue";

export default {
  components: { Nav },
  data() {
    return {
      patients: [],
      filteredPatients: [],
      searchQuery: "",
      loading: false,
    };
  },
  async mounted() {
    await this.bootstrap();
  },
  methods: {
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
      }

      if (!auth?.success || auth.user?.role !== "hospital") {
        this.$router.push("/dashboard");
        return;
      }

      await this.fetchPatients();
    },
    async fetchPatients() {
      this.loading = true;
      const bearer = localStorage.getItem("bearer");
      try {
        const result = await getHospitalPatients(
          this.$store.state.apiURI,
          bearer
        );
        if (result.error) {
          throw new Error(result.error);
        }
        this.patients = (result.patients || []).map((entry) => {
          const status = this.consentStatus(entry);
          return {
            consentId: entry.consentId,
            patient: entry.patient,
            records: entry.records || [],
            purpose: entry.purpose,
            expiresAt: entry.expiresAt,
            revokedAt: entry.revokedAt,
            createdAt: entry.createdAt,
            solanaTx: entry.solanaTx,
            statusLabel: status.label,
            statusVariant: status.variant,
          };
        });
        this.filteredPatients = [...this.patients];
      } catch (err) {
        console.error("Failed to fetch hospital patients:", err);
      } finally {
        this.loading = false;
      }
    },
    filterPatients() {
      const query = this.searchQuery.toLowerCase();
      this.filteredPatients = this.patients.filter((entry) =>
        (entry.patient?.username || "")
          .toLowerCase()
          .includes(query)
      );
    },
    consentStatus(entry) {
      if (entry.revokedAt) {
        return { label: "Revoked", variant: "bg-danger" };
      }
      if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
        return { label: "Expired", variant: "bg-warning" };
      }
      return { label: "Active", variant: "bg-success" };
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
          <div class="mb-5 d-flex justify-content-between align-items-center">
            <h2 class="fw-bold mb-0">Hospital Dashboard</h2>
          </div>

          <div class="p-3 rounded-3">
            <div
              class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-3"
            >
              <h5 class="text-uppercase text-white-50 mb-0">
                Authorized Patients
              </h5>
            </div>

            <input
              type="text"
              class="form-control frosted-sub text-white mb-4"
              placeholder="Search patients..."
              v-model="searchQuery"
              @input="filterPatients"
            />

            <div v-if="loading" class="text-center text-white-50 py-5">
              Loading patients...
            </div>

            <div
              v-else-if="filteredPatients.length"
              class="table-responsive"
            >
              <table class="table table-borderless align-middle text-white">
                <thead>
                  <tr class="text-uppercase text-white-50 small">
                    <th scope="col">Patient</th>
                    <th scope="col">Authorized Records</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Status</th>
                    <th scope="col">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="entry in filteredPatients"
                    :key="entry.consentId"
                    class="frosted-inner"
                  >
                    <td>
                      <div class="fw-semibold">
                        {{ entry.patient?.username || "Unknown Patient" }}
                      </div>
                      <div class="text-white-50 small">
                        {{ entry.patient?.email || "No email" }}
                      </div>
                    </td>
                    <td>
                      <div
                        v-if="entry.records.length"
                        class="d-flex flex-wrap gap-2"
                      >
                        <a
                          v-for="record in entry.records"
                          :key="record.id"
                          :href="record.downloadUrl"
                          target="_blank"
                          class="btn btn-outline-light btn-sm"
                        >
                          {{ record.fileName }}
                        </a>
                      </div>
                      <span v-else class="text-white-50 small">
                        No authorized records.
                      </span>
                    </td>
                    <td class="text-white-50">
                      {{ entry.purpose || "care" }}
                    </td>
                    <td>
                      <span class="badge" :class="entry.statusVariant">
                        {{ entry.statusLabel }}
                      </span>
                      <div class="text-white-50 small mt-1">
                        Expires:
                        {{ entry.expiresAt ? (new Date(entry.expiresAt)).toLocaleDateString() : "—" }}
                      </div>
                    </td>
                    <td>
                      <a
                        v-if="entry.solanaTx"
                        :href="`https://explorer.solana.com/tx/${entry.solanaTx}?cluster=devnet`"
                        target="_blank"
                        class="text-info text-decoration-none small"
                      >
                        View TX
                      </a>
                      <span v-else class="text-white-50 small">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="text-center text-white-50 py-5">
              <p>No patients have authorized access yet.</p>
            </div>
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

.table tbody tr:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
