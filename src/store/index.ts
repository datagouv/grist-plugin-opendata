import { createStore } from 'vuex';
interface State {
  docId: string;
  tableId: string;
  token: string;
  apikey: string;
  profile: Record<string, any>;
  menuOption: string | null;
  publierOrganization: string | null;
  publierTables: string[];
  activeGristTables: string[];
}

function loadPersisted<T = string>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (v as unknown as T) : fallback;
  } catch { return fallback; }
}

const store = createStore<State>({
  state: {
    docId:              '',
    tableId:            '',
    token:              loadPersisted('dg_token', ''),
    apikey:             loadPersisted('dg_apikey', ''),
    profile:            {},
    menuOption:         null,
    publierOrganization: null,
    publierTables:      [],
    activeGristTables:  []
  },
  mutations: {
    setTableId          (s, v: string) { s.tableId = v; },
    setDocId            (s, v: string) { s.docId = v; },
    setToken            (s, v: string) { s.token = v; },
    setApiKey           (s, v: string) { s.apikey = v; },
    setProfile          (s, v: Record<string, any>) { s.profile = v; },
    setMenuOption       (s, v: string) { s.menuOption = v; },
    setPublierOrganization (s, v: string|null) { s.publierOrganization = v; },
    setActiveGristTables(s, v: string[]) { s.activeGristTables = v; },
    setPublierTables    (s, v: string[]) { s.publierTables = v; },
    clearAuth           (s) { s.token = s.apikey = ''; s.profile = {}; }
  },
  actions: {
    updateDocId({ commit }, id)      { commit('setDocId', id); },
    updateToken({ commit }, token)   {
      commit('setToken', token);
      localStorage.setItem('dg_token', token);
    },
    updateProfile({ commit, dispatch }, profile) {
      commit('setProfile', profile);
      if (profile?.apikey) dispatch('updateApiKey', profile.apikey);
    },
    logout({ commit }) {
      commit('clearAuth');
      localStorage.removeItem('dg_token');
      localStorage.removeItem('dg_apikey');
    },
    /* actions déjà présentes */
    updateMenuOption        ({ commit }, v) { commit('setMenuOption', v); },
    updatePublierOrganization({ commit }, v){ commit('setPublierOrganization', v); },
    updateActiveGristTables ({ commit }, v) { commit('setActiveGristTables', v); },
    updatePublierTables     ({ commit }, v) { commit('setPublierTables', v); }
  },
  getters: {
    /* existants */
    docId:      s => s.docId,
    token:      s => s.token,
    apikey:     s => s.apikey,
    bearer:     s => (s.token ? `Bearer ${s.token}` : ''),
    profile:    s => s.profile,
    isLogged:   s => !!s.token,
    menuOption: s => s.menuOption,
    publierOrganization: s => s.publierOrganization,
    activeGristTables:   s => s.activeGristTables,
    publierTables:       s => s.publierTables
  }
});

export default store;
