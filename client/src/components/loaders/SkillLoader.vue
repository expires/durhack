<script>
import skeletonLoader from "./SkeletonLoader.vue";

export default {
  components: { skeletonLoader },
  props: {
    loading: Boolean,
  },
  data() {
    return {
      computedSkillHeight: 0,
    };
  },
  watch: {
    skillHeight() {},
  },
  computed: {
    skillHeight() {
      this.$nextTick(() => {
        let height = this.$refs.skill[0].offsetHeight * 4 + 3.2 * 4 + 6 * 4;
        this.computedSkillHeight = height;
      });
    },
  },
  methods: {
    returnRandom() {
      return Math.random() < 0.5
        ? Math.random().toString(36).substring(2, 7)
        : Math.random().toString(36).substring(2, 14);
    },
  },
};
</script>

<template>
  <div
    class="m-0 p-0 skill-div"
    :key="loading"
    :style="{ height: computedSkillHeight + 'px' }"
  >
    <skeletonLoader
      v-for="i in 16"
      class="skill"
      :loading="loading"
      style="border: solid 3px #242526 !important"
    >
      <div ref="skill" class="py-2 px-4">
        <img alt="" class="icon" />

        {{ returnRandom() }}
      </div>
    </skeletonLoader>
  </div>
</template>

<style>
@import "@/assets/styles/vars.scss";
@import "@/assets/styles/bio.scss";
</style>
