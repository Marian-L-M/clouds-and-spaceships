import { store, getElement, getContext } from "@wordpress/interactivity";

interface HeaderContext {
  isSearchOpen: boolean;
}

store("cns-theme/cns-header", {
  actions: {
    // toggleSearch() {
    //   const context = getContext<HeaderContext>();
    //   context.isSearchOpen = !context.isSearchOpen;
    // },
  },
  callbacks: {
    trackScroll() {
      const { ref } = getElement();
      ref?.classList.toggle("is-scrolled", window.scrollY > 0);
    },
  },
});
