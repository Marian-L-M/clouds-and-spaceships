import { store, getContext } from "@wordpress/interactivity";

store( "cns-theme/cns-multi-image", {
  state: {
    get activeMainUrl() {
      const ctx = getContext();
      return ctx.images[ ctx.activeIndex ]?.urlLarge ?? "";
    },
    get activeLightboxUrl() {
      const ctx = getContext();
      return ctx.images[ ctx.activeIndex ]?.urlFull ?? "";
    },
    get activeAlt() {
      const ctx = getContext();
      return ctx.images[ ctx.activeIndex ]?.alt ?? "";
    },
    // Evaluated per thumbnail: getContext() includes the thumb's own { index }
    // merged with the root context's { activeIndex, … }.
    get isThumbActive() {
      const ctx = getContext();
      return ctx.activeIndex === ctx.index;
    },
  },

  actions: {
    prev() {
      const ctx = getContext();
      ctx.activeIndex =
        ( ctx.activeIndex - 1 + ctx.images.length ) % ctx.images.length;
    },

    next() {
      const ctx = getContext();
      ctx.activeIndex = ( ctx.activeIndex + 1 ) % ctx.images.length;
    },

    setActive() {
      const ctx = getContext();
      ctx.activeIndex = ctx.index;
    },

    openLightbox() {
      const ctx = getContext();
      ctx.lightboxOpen = true;
      document.body.style.overflow = "hidden";
    },

    closeLightbox() {
      const ctx = getContext();
      ctx.lightboxOpen = false;
      document.body.style.overflow = "";
    },

    // Attached via data-wp-on-document--keydown on the block wrapper.
    // Fires for every keydown on the document; bail early when not Escape
    // or when no lightbox is open for this block instance.
    handleEscape( event ) {
      if ( event.key !== "Escape" ) return;
      const ctx = getContext();
      if ( ! ctx.lightboxOpen ) return;
      ctx.lightboxOpen = false;
      document.body.style.overflow = "";
    },
  },
} );
