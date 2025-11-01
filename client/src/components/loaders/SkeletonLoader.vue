<script>
export default {
  props: {
    loading: {
      type: Boolean,
    },
  },
};
</script>

<template>
  <div class="position-relative">
    <Transition name="fade-display" mode="out-in">
      <div
        v-if="loading == true"
        :key="loading"
        class="divloader rounded-3"
      ></div>
    </Transition>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.fade-display-enter-active,
.fade-display-leave-active {
  transition: opacity 0.2s ease, display 0.2s;
}
.fade-display-enter-from,
.fade-display-leave-to {
  opacity: 0;
  display: none;
}

.divloader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  background: linear-gradient(
      135deg,
      #242526 33%,
      rgba(255, 255, 255, 0.0375) 50%,
      #242526 66%
    )
    #242526;
  background-size: 500% 100%;
  animation: shineAnimation 1000ms linear infinite;
  animation-fill-mode: backwards;
  transition: ease 200ms;
}
@keyframes shineAnimation {
  0% {
    background-position: right;
  }
}
</style>
