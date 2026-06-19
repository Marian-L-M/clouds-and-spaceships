import { store, getContext } from "@wordpress/interactivity";

interface SidebarContext {
  isOpen: boolean;
  isMobileOpen: boolean;
  isGroupOpen: boolean;
}

store("cns-theme/cns-sidebar", {
  actions: {
    // ── Toggle mode (overlay) ─────────────────────────────────────────────
    toggleSidebar() {
      const ctx = getContext<SidebarContext>();
      ctx.isOpen = !ctx.isOpen;
      document.body.style.overflow = ctx.isOpen ? "hidden" : "";
    },

    closeSidebar() {
      const ctx = getContext<SidebarContext>();
      ctx.isOpen = false;
      document.body.style.overflow = "";
    },

    handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const ctx = getContext<SidebarContext>();
      if (ctx.isOpen) {
        ctx.isOpen = false;
        document.body.style.overflow = "";
      }
    },

    // ── Fixed mode — mobile accordion ─────────────────────────────────────
    toggleMobile() {
      const ctx = getContext<SidebarContext>();
      ctx.isMobileOpen = !ctx.isMobileOpen;
    },

    // ── Group toggles ─────────────────────────────────────────────────────
    toggleGroup() {
      const ctx = getContext<SidebarContext>();
      ctx.isGroupOpen = !ctx.isGroupOpen;
    },
  },
});
