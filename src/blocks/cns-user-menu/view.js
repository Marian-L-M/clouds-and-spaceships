import { store, getContext } from "@wordpress/interactivity";

store("cns-theme/cns-user-menu", {
  actions: {
    toggle() {
      const context = getContext();
      context.isOpen = !context.isOpen;
    },
  },
});
