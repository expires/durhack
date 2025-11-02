import Vuex from "vuex";

const store = new Vuex.Store({
  state: {
    apiURI: "http://localhost:3000/v1/",
    users: [],
    search: "",
    notification: {},
    saves: false,
    user: null,
  },
  mutations: {
    setUsers(state, usersData) {
      state.users = usersData;
    },
    setSearch(state, search) {
      state.search = search;
    },
    setNotification(state, notification) {
      state.notification = notification;
    },
    setSave(state) {
      state.saves = !state.saves;
    },
    setUser(state, user) {
      state.user = user;
    },
  },
  actions: {
    updateUsers({ commit }, usersData) {
      commit("setUsers", usersData);
    },
    updateSearch({ commit }, search) {
      commit("setSearch", search);
    },
    updateNotification({ commit }, notification) {
      commit("setNotification", notification);
    },
    updateSave({ commit }) {
      commit("setSave");
    },
    updateUser({ commit }, user) {
      commit("setUser", user);
    },
  },
});

export default store;
