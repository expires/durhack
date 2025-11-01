<script>
import skeletonLoader from "./SkeletonLoader.vue";

export default {
  components: { skeletonLoader },
  props: {
    loading: Boolean,
  },

  methods: {},
};
</script>

<template>
  <div class="px-1 pe-2">
    <div class="row g-1">
      <div class="col-6" v-for="i in 10">
        <skeletonLoader :loading="loading">
          <div
            class="py-2 d-flex justify-content-center w-100 rounded-3 btn-socials frosted"
          >
            <img src="@/assets/images/link.svg" class="p-1" />
          </div>
        </skeletonLoader>
      </div>
    </div>
  </div>
</template>

<style>
@import "@/assets/styles/vars.scss";
@import "@/assets/styles/bio.scss";
</style>
