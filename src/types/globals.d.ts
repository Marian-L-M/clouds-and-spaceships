// Globals injected by the theme's PHP (wp_localize_script / inline data) and
// by the toast module at runtime.

export {};

/** Toast notification severity. */
type CnsToastType = "success" | "error" | "info" | "warning";

/** Public API exposed by src/modules/toast.ts on the global window. */
interface CnsToast {
  show(message: string, type?: CnsToastType, duration?: number): HTMLElement;
}

/** Data localized into the editor by the theme. */
interface CnsThemeData {
  theme_uri: string;
  [key: string]: unknown;
}

declare global {
  // eslint-disable-next-line no-var
  var cnsThemeData: CnsThemeData;

  interface Window {
    cnsThemeData: CnsThemeData;
    cnsToast?: CnsToast;
  }
}
