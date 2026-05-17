import { store, getContext } from "@wordpress/interactivity";

store( "cns-theme/cns-sidebar", {
	actions: {
		// ── Toggle mode (overlay) ─────────────────────────────────────────────
		toggleSidebar() {
			const ctx = getContext();
			ctx.isOpen = ! ctx.isOpen;
			document.body.style.overflow = ctx.isOpen ? "hidden" : "";
		},

		closeSidebar() {
			const ctx = getContext();
			ctx.isOpen = false;
			document.body.style.overflow = "";
		},

		handleEscape( event ) {
			if ( event.key !== "Escape" ) return;
			const ctx = getContext();
			if ( ctx.isOpen ) {
				ctx.isOpen = false;
				document.body.style.overflow = "";
			}
		},

		// ── Fixed mode — mobile accordion ─────────────────────────────────────
		toggleMobile() {
			const ctx = getContext();
			ctx.isMobileOpen = ! ctx.isMobileOpen;
		},

		// ── Group toggles ─────────────────────────────────────────────────────
		toggleGroup() {
			const ctx = getContext();
			ctx.isGroupOpen = ! ctx.isGroupOpen;
		},
	},
} );
