import store from "./store";

export default async (to, from, next) => {
  let bearer = localStorage.getItem("bearer");

  if (bearer?.length > 0) {
    if (to.fullPath !== "/") {
      store.dispatch("updateNotification", {
        success: "Already logged in.",
      });
    }
    return next();
  } else {
    if (to.fullPath === "/") {
      store.dispatch("updateNotification", {
        error: "Not Authenticated.",
      });
    }
    next();
  }
};
