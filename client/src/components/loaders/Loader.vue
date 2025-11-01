<template>
  <div class="mt-5 pt-5 w-100 d-flex justify-content-center">
    <div id="wifi-loader">
      <svg class="circle-outer" viewBox="0 0 86 86">
        <circle class="back" cx="43" cy="43" r="40"></circle>
        <circle class="front" cx="43" cy="43" r="40"></circle>
        <circle class="new" cx="43" cy="43" r="40"></circle>
      </svg>
      <svg class="circle-middle" viewBox="0 0 60 60">
        <circle class="back" cx="30" cy="30" r="27"></circle>
        <circle class="front" cx="30" cy="30" r="27"></circle>
      </svg>
      <svg class="circle-inner" viewBox="0 0 34 34">
        <circle class="back" cx="17" cy="17" r="14"></circle>
        <circle class="front" cx="17" cy="17" r="14"></circle>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes circle-outer135 {
  0% {
    stroke-dashoffset: 25;
  }
  25% {
    stroke-dashoffset: 0;
  }
  65% {
    stroke-dashoffset: 301;
  }
  80% {
    stroke-dashoffset: 276;
  }
  100% {
    stroke-dashoffset: 276;
  }
}
@keyframes circle-middle6123 {
  0% {
    stroke-dashoffset: 17;
  }
  25% {
    stroke-dashoffset: 0;
  }
  65% {
    stroke-dashoffset: 204;
  }
  80% {
    stroke-dashoffset: 187;
  }
  100% {
    stroke-dashoffset: 187;
  }
}
@keyframes circle-inner162 {
  0% {
    stroke-dashoffset: 9;
  }
  25% {
    stroke-dashoffset: 0;
  }
  65% {
    stroke-dashoffset: 106;
  }
  80% {
    stroke-dashoffset: 97;
  }
  100% {
    stroke-dashoffset: 97;
  }
}
@keyframes text-animation76 {
  0% {
    clip-path: inset(0 100% 0 0);
  }
  50% {
    clip-path: inset(0);
  }
  100% {
    clip-path: inset(0 0 0 100%);
  }
}
#wifi-loader {
  --background: #62abff;
  --front-color: rgba(0, 255, 170, 1);
  --back-color: rgba(0, 255, 170, 0.2);
  width: 64px;
  height: 64px;
  border-radius: 50px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    circle {
      position: absolute;
      fill: none;
      stroke-width: 6px;
      stroke-linecap: round;
      stroke-linejoin: round;
      transform: rotate(-100deg);
      transform-origin: center;
    }
    circle.back {
      stroke: var(--back-color);
    }
    circle.front {
      stroke: var(--front-color);
    }
  }
  svg.circle-outer {
    height: 86px;
    width: 86px;
    circle {
      stroke-dasharray: 62.75 188.25;
    }
    circle.back {
      animation: circle-outer135 1.8s ease infinite 0.3s;
    }
    circle.front {
      animation: circle-outer135 1.8s ease infinite 0.15s;
    }
  }
  svg.circle-middle {
    height: 60px;
    width: 60px;
    circle {
      stroke-dasharray: 42.5 127.5;
    }
    circle.back {
      animation: circle-middle6123 1.8s ease infinite 0.25s;
    }
    circle.front {
      animation: circle-middle6123 1.8s ease infinite 0.1s;
    }
  }
  svg.circle-inner {
    height: 34px;
    width: 34px;
    circle {
      stroke-dasharray: 22 66;
    }
    circle.back {
      animation: circle-inner162 1.8s ease infinite 0.2s;
    }
    circle.front {
      animation: circle-inner162 1.8s ease infinite 0.05s;
    }
  }
}
</style>
