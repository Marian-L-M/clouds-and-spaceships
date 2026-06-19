import { store, getContext } from "@wordpress/interactivity";

interface SectionContext {
  tabIndex: number;
  panelIndex: number;
  activeTab: number;
}

store("cns-theme/cns-section", {
  state: {
    get isTabActive(): boolean {
      const ctx = getContext<SectionContext>();
      return ctx.tabIndex === ctx.activeTab;
    },
    get isPanelActive(): boolean {
      const ctx = getContext<SectionContext>();
      return ctx.panelIndex === ctx.activeTab;
    },
  },
  actions: {
    setTab() {
      const ctx = getContext<SectionContext>();
      ctx.activeTab = ctx.tabIndex;
    },
  },
});
