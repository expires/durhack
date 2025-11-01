<script>
export default {
  props: {
    notif: {
      type: Object,
    },
  },
};
</script>

<template>
  <div>
    <div
      v-if="notif.success && notif.success.length > 0"
      class="success px-5 py-3 rounded-3"
    >
      <div class="row">
        <div class="col-12 d-flex justify-content-start align-items-center">
          <div>
            <h6 class="pb-1">{{ notif.success }}</h6>
          </div>
        </div>
      </div>
      <div class="slider rounded-3"></div>
    </div>
    <div v-if="notif.error" class="error px-5 py-3 rounded-3">
      <div class="row">
        <div class="col-12 d-flex justify-content-start align-items-center">
          <div>
            <h6 class="pb-1">{{ notif.error }}</h6>
          </div>
        </div>
      </div>
      <div class="slider rounded-3"></div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/styles/vars.scss";
@import "@/assets/styles/notification.scss";
</style>
