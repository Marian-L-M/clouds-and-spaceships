import {
  Icon,
  commentAuthorAvatar,
  external,
  mapMarker,
  pages,
  pencil,
} from "@wordpress/icons";

/**
 * Icon set for credit links etc. — @wordpress/icons, mirrored on the frontend
 * by cns_render_icon() in functions/design-functions.php. Keep both in sync.
 */
const ICONS: Record<string, JSX.Element> = {
  marker: mapMarker,
  book: pages,
  user: commentAuthorAvatar,
  external,
  edit: pencil,
};

export function CnsRenderIcon(icon: string) {
  const match = ICONS[icon.toLowerCase()];
  if (!match) return null;
  return <Icon icon={match} className="cns-elements__icon" />;
}
