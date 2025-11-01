<script>
import { deleteLogout } from "../../services/index";

export default {
  data() {
    return {
      bearer: localStorage.getItem("bearer") || "",
    };
  },
  methods: {
    async logout() {
      this.$router.push("/login");
      localStorage.setItem("bearer", "");
      const result = await deleteLogout(this.$store.state.apiURI, this.bearer);
      this.$store.dispatch("updateNotification", result);
    },
  },
};
</script>

<template>
  <nav class="navbar-container py-3 px-4">
    <div class="d-flex align-items-center justify-content-between w-100">
      <!-- Logo (routes home) -->
      <RouterLink to="/" class="d-flex align-items-center text-decoration-none">
        <img
            src="@/assets/images/logo.png"
            alt="BridgeHealth"
            width="42"
            height="42"
            class="rounded-3 me-3 logo"
        />
        <span class="fw-bold text-white fs-5 brand-text">BridgeHealth</span>
      </RouterLink>

      <!-- Nav Actions -->
      <div class="d-flex align-items-center gap-3">
        <!-- Not Logged In -->
        <RouterLink
            v-if="bearer.length < 1"
            to="/login"
            class="btn-nav text-decoration-none"
        >
          Login
        </RouterLink>
        <RouterLink
            v-if="bearer.length < 1"
            to="/signup"
            class="btn-nav text-decoration-none"
        >
          Sign Up
        </RouterLink>

        <!-- Primary Logout (no gradient, frosted-glow) -->
        <button
            v-if="bearer.length > 0"
            class="btn-frosted-primary"
            @click="logout"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.navbar-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  color: #fff;
  transition: all 0.3s ease;
}

.logo {
  border: solid 2px rgba(255, 255, 255, 0.15);
  transition: 0.3s ease;
}
.logo:hover {
  transform: rotate(-3deg) scale(1.05);
}

.brand-text {
  letter-spacing: 0.5px;
  opacity: 0.9;
}

/* 🔹 Secondary Frosted Buttons */
.btn-nav {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.45rem 1rem;
  border-radius: 0.6rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.btn-nav:hover {
  background: rgba(0, 255, 170, 0.15);
  border-color: rgba(0, 255, 170, 0.25);
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.3);
  transform: translateY(-2px);
  color: #00ffaa;
}

/* ⚡ Frosted Primary Button (Logout) */
.btn-frosted-primary {
  background: rgba(0, 255, 170, 0.15);
  border: 1px solid rgba(0, 255, 170, 0.4);
  color: #00ffaa;
  padding: 0.5rem 1.2rem;
  border-radius: 0.6rem;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.25);
  transition: all 0.25s ease;
}

.btn-frosted-primary:hover {
  background: rgba(0, 255, 170, 0.25);
  border-color: rgba(0, 255, 170, 0.6);
  box-shadow: 0 0 16px rgba(0, 255, 170, 0.4);
  transform: translateY(-2px);
  color: #00ffaa;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
