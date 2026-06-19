import { store, getContext } from "@wordpress/interactivity";
import type { GalleryImage } from "./edit";

interface MultiImageContext {
  images: GalleryImage[];
  activeIndex: number;
  /** Present on per-thumbnail contexts. */
  index: number;
  lightboxOpen: boolean;
}

store("cns-theme/cns-multi-image", {
  state: {
    get activeMainUrl(): string {
      const ctx = getContext<MultiImageContext>();
      return ctx.images[ctx.activeIndex]?.urlLarge ?? "";
    },
    get activeLightboxUrl(): string {
      const ctx = getContext<MultiImageContext>();
      return ctx.images[ctx.activeIndex]?.urlFull ?? "";
    },
    get activeAlt(): string {
      const ctx = getContext<MultiImageContext>();
      return ctx.images[ctx.activeIndex]?.alt ?? "";
    },
    // Evaluated per thumbnail: getContext() includes the thumb's own { index }
    // merged with the root context's { activeIndex, … }.
    get isThumbActive(): boolean {
      const ctx = getContext<MultiImageContext>();
      return ctx.activeIndex === ctx.index;
    },
  },

  actions: {
    prev() {
      const ctx = getContext<MultiImageContext>();
      ctx.activeIndex =
        (ctx.activeIndex - 1 + ctx.images.length) % ctx.images.length;
    },

    next() {
      const ctx = getContext<MultiImageContext>();
      ctx.activeIndex = (ctx.activeIndex + 1) % ctx.images.length;
    },

    setActive() {
      const ctx = getContext<MultiImageContext>();
      ctx.activeIndex = ctx.index;
    },

    openLightbox() {
      const ctx = getContext<MultiImageContext>();
      ctx.lightboxOpen = true;
      document.body.style.overflow = "hidden";
    },

    closeLightbox() {
      const ctx = getContext<MultiImageContext>();
      ctx.lightboxOpen = false;
      document.body.style.overflow = "";
    },

    // Attached via data-wp-on-document--keydown on the block wrapper.
    // Fires for every keydown on the document; bail early when not Escape
    // or when no lightbox is open for this block instance.
    handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const ctx = getContext<MultiImageContext>();
      if (!ctx.lightboxOpen) return;
      ctx.lightboxOpen = false;
      document.body.style.overflow = "";
    },
  },
});
