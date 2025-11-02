import store from "./store";

const authRoutes = ["/login", "/signup", "/reset"];
const providerRoles = [
  "hospital",
  "doctor",
  "researcher",
  "auditor",
  "insurance",
  "emergency",
];

export default async (to, from, next) => {
  const bearer = localStorage.getItem("bearer");
  const storedRole = localStorage.getItem("role");
  const role = store.state.user?.role || storedRole;

  if (bearer?.length) {
    if (!store.state.user && role) {
      store.dispatch("updateUser", { role });
    }

    if (authRoutes.includes(to.path)) {
      return next(providerRoles.includes(role) ? "/hospital" : "/dashboard");
    }

    if (to.path === "/hospital" && !providerRoles.includes(role)) {
      return next("/dashboard");
    }

    if (to.path === "/dashboard" && providerRoles.includes(role)) {
      return next("/hospital");
    }

    return next();
  }

  if (to.path === "/dashboard" || to.path === "/hospital") {
    store.dispatch("updateNotification", {
      error: "Not Authenticated.",
    });
    return next("/login");
  }

  return next();
};
