import { createRouter, createWebHistory } from "vue-router";
import authRedirect from "../utils/authRedirect";

import Index from "../views/Index.vue";
import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";
import Reset from "../views/Reset.vue";
import Dashboard from "../views/Dashboard.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Index,
    },
    {
      path: "/signup",
      name: "signup",
      component: Signup,
      beforeEnter: authRedirect,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      beforeEnter: authRedirect,
    },
    {
      path: "/reset",
      name: "reset password",
      component: Reset,
      beforeEnter: authRedirect,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
      beforeEnter: authRedirect,
    }
  ],
});

router.beforeEach((to, from, next) => {
  document.title = "branch | " + to.name;
  next();
});

export default router;
