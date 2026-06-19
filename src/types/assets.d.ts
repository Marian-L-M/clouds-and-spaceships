// Ambient declarations for non-code imports handled by webpack loaders.

declare module "*.scss";
declare module "*.css";

// @glidejs/glide ships no type declarations; declare the minimal surface used.
declare module "@glidejs/glide" {
  export interface GlideOptions {
    type?: "carousel" | "slider";
    startAt?: number;
    perView?: number;
    focusAt?: number | "center";
    gap?: number;
    autoplay?: number | false;
    hoverpause?: boolean;
    keyboard?: boolean;
    bound?: boolean;
    swipeThreshold?: number | false;
    dragThreshold?: number | false;
    perTouch?: number | false;
    touchRatio?: number;
    touchAngle?: number;
    animationDuration?: number;
    rewind?: boolean;
    rewindDuration?: number;
    animationTimingFunc?: string;
    direction?: "ltr" | "rtl";
    peek?: number | { before: number; after: number };
    breakpoints?: Record<number, Partial<GlideOptions>>;
    draggable?: boolean;
    [option: string]: unknown;
  }

  export default class Glide {
    constructor(selector: string | HTMLElement, options?: GlideOptions);
    mount(extensions?: Record<string, unknown>): this;
    destroy(): void;
    update(options?: GlideOptions): this;
    on(event: string | string[], handler: (...args: unknown[]) => void): this;
    go(pattern: string): this;
    disable(): this;
    enable(): this;
    readonly index: number;
    readonly settings: GlideOptions;
  }
}
