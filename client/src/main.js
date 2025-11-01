import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./utils/store";

import "./assets/styles/main.scss";
import "./assets/styles/responsive.scss";

const app = createApp(App);

app.use(router);
app.use(store);

app.mount("#app");
