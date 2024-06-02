import { createStore } from 'vuex';

interface State {
  docId: String;
  tableId: String;
  token: String;
  profile: Object;
  menuOption: String|null;
  publierOrganization: String|null;
  publierTables: Array<String>;
  activeGristTables: Array<String>;
}

const store = createStore<State>({
  state: {
    docId: "",
    tableId: "",
    token: "",
    profile: {},
    menuOption: null,
    publierOrganization: null,
    activeGristTables: [],
    publierTables: [],
  },
  mutations: {
    setTableId(state, payload: String) {
      state.tableId = payload
    },
    setDocId(state, payload: String) {
      state.docId = payload
    },
    setToken(state, payload: String) {
      state.token = payload
    },
    setProfile(state, payload: String) {
      state.profile = payload
    },
    setMenuOption(state, payload: String) {
      state.menuOption = payload
    },
    setPublierOrganization(state, payload: String) {
      state.publierOrganization = payload
    },
    setActiveGristTables(state, payload: Array<String>) {
      state.activeGristTables = payload
    },
    setPublierTables(state, payload: Array<String>) {
      state.publierTables = payload
    }
  },
  actions: {
    updateDocId({ commit }, id) {
      commit('setDocId', id);
    },
    updateToken({ commit }, token) {
      commit('setToken', token);
    },
    updateProfile({ commit }, profile) {
      commit('setProfile', profile);
    },
    updateMenuOption({ commit }, menuOption) {
      commit('setMenuOption', menuOption);
    },
    updatePublierOrganization({ commit }, publierOrganization) {
      commit('setPublierOrganization', publierOrganization);
    },
    updateActiveGristTables({ commit }, activeGristTables) {
      commit('setActiveGristTables', activeGristTables);
    },
    updatePublierTables({ commit }, publierTables) {
      commit('setPublierTables', publierTables);
    }
  },
  getters: {
    docId: state => state.docId,
    token: state => state.token,
    profile: state => state.profile,
    menuOption: state => state.menuOption,
    publierOrganization: state => state.publierOrganization,
    activeGristTables: state => state.activeGristTables,
    publierTables: state => state.publierTables,
  }
});

export default store;