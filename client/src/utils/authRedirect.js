import store from "./store";

const authRoutes = ["/login", "/signup", "/reset"];

export default async (to, from, next) => {
  const bearer = localStorage.getItem("bearer");
  const storedRole = localStorage.getItem("role");
  const role = store.state.user?.role || storedRole;

  if (bearer?.length) {
    if (!store.state.user && role) {
      store.dispatch("updateUser", { role });
    }

    if (authRoutes.includes(to.path)) {
      return next(role === "hospital" ? "/hospital" : "/dashboard");
    }

    if (to.path === "/hospital" && role !== "hospital") {
      return next("/dashboard");
    }

    if (to.path === "/dashboard" && role === "hospital") {
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
