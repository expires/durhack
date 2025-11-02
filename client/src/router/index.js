import { createRouter, createWebHistory } from "vue-router";
import authRedirect from "../utils/authRedirect";

import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";
import Reset from "../views/Reset.vue";
import Dashboard from "../views/Dashboard.vue";
import HospitalDashboard from "../views/HospitalDashboard.vue";
import AddHospital from "../views/AddHospital.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
      beforeEnter: authRedirect,
    },
    {
      path: "/hospital",
      name: "hospital dashboard",
      component: HospitalDashboard,
      beforeEnter: authRedirect,
    },
    {
      path: "/addprovider",
      name: "add hospital",
      component: AddHospital,
      beforeEnter: authRedirect,
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
  ],
});

router.beforeEach((to, from, next) => {
  document.title = "BridgeHealth | " + to.name;
  next();
});

export default router;
