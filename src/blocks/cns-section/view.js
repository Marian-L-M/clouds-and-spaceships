import { store, getContext } from "@wordpress/interactivity";

store("cns-theme/cns-section", {
  state: {
    get isTabActive() {
      const ctx = getContext();
      return ctx.tabIndex === ctx.activeTab;
    },
    get isPanelActive() {
      const ctx = getContext();
      return ctx.panelIndex === ctx.activeTab;
    },
  },
  actions: {
    setTab() {
      const ctx = getContext();
      ctx.activeTab = ctx.tabIndex;
    },
  },
});
