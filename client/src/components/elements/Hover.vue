<script>
export default {
  data() {
    return {
      circle: false,
      circleStyle: {
        left: "0px",
        top: "0px", 
      },
    };
  },
  methods: {
    showCircle() {
      this.circle = true;
    },
    hideCircle() {
      this.circle = false;
    },
    moveCircle(event) {
      if (this.circle) {
        requestAnimationFrame(() => {
          this.circleStyle.left = `${
            event.clientX - this.$el.getBoundingClientRect().left
          }px`;
          this.circleStyle.top = `${
            event.clientY - this.$el.getBoundingClientRect().top
          }px`;
        });
      }
    },
  },
};
</script>

<template>
  <div
    class="rounded-3 m-0 p-0 position-relative overflow-hidden"
    @mousemove="moveCircle"
  >
    <transition name="fade">
      <div class="gradient-circle" :style="circleStyle" v-if="circle"></div>
    </transition>
    <div class="p-0 m-0" @mouseenter="showCircle" @mouseleave="hideCircle">
      <slot class="m-0 p-0"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/vars.scss";

.gradient-circle {
  position: absolute;
  width: 250px;
  height: 250px;
  opacity: 0.25;
  border-radius: 50%;
  background: $text-primary;
  pointer-events: none;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  filter: blur(100px);
  transition: ease 100ms;
  animation: test linear 0.25s;
}

@keyframes test {
  0% {
    opacity: 0;
    width: 0px;
    height: 0px;
    filter: blur(10px);
  }
  100% {
    width: 250px;
    height: 250px;
    opacity: 0.25;
    filter: blur(100px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, width 0.5s, height 0.5s, filter 0.5s;
}

.fade-enter {
  opacity: 0;
  width: 0px;
  height: 0px;
  filter: blur(10px);
}

.fade-leave-to {
  opacity: 0;
  width: 0px;
  height: 0px;
  filter: blur(10px);
}
</style>
