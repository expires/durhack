<script>
import { getConsentTimeline } from "../services/consents";

export default {
  name: "PatientTimeline",
  data() {
    return {
      timeline: [],
      loading: false,
      error: null,
    };
  },
  async mounted() {
    await this.fetchTimeline();
  },
  methods: {
    async fetchTimeline() {
      const bearer = localStorage.getItem("bearer");
      if (!bearer) return;
      this.loading = true;
      try {
        const result = await getConsentTimeline(this.$store.state.apiURI, bearer);
        if (result.error) {
          this.error = result.error;
        } else {
          this.timeline = result.timeline || [];
        }
      } catch (err) {
        console.error("Timeline fetch error", err);
        this.error = "Failed to load timeline.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div class="timeline-container ps-3">
    <h5 class="text-uppercase text-white-50 mb-3  ">Consent Timeline</h5>
    <p v-if="loading" class="text-white-50">Loading timeline…</p>
    <p v-else-if="error" class="text-danger">{{ error }}</p>
    <ul v-else class="timeline">
      <li v-for="item in timeline" :key="item._id" class="timeline-item">
        <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
          <span :class="item.type === 'create' ? 'text-success' : 'text-danger'">
            {{ item.type === 'create' ? '🟢 Granted' : '🔴 Revoked' }}
          </span>
          <span class="text-white">{{ item.providerName }} ({{ item.purpose }})</span>
          <span class="text-white-50 small">{{ new Date(item.date).toLocaleString() }}</span>
        </div>
        <a
          v-if="item.solanaTx"
          :href="`https://explorer.solana.com/tx/${item.solanaTx}?cluster=devnet`"
          target="_blank"
          class="text-info small"
        >
          View on Solana
        </a>
      </li>
      <li v-if="!timeline.length" class="text-white-50">No consent activity yet.</li>
    </ul>
  </div>
</template>

<style scoped>
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
}

.timeline-item {
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.timeline-item:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
