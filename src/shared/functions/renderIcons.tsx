import {
  MapPin,
  User,
  SquareArrowOutUpRight,
  SquarePen,
  BookOpenText,
} from "lucide-react";

export function CnsRenderIcon(icon: string) {
  switch (icon) {
    case "marker":
      return (
        <MapPin className="cns-elements__icon cns-elements__icon-stroke" />
      );
    case "book":
      return (
        <BookOpenText className="cns-elements__icon cns-elements__icon-stroke" />
      );
    case "user":
      return <User className="cns-elements__icon cns-elements__icon-stroke" />;
    case "external":
      return (
        <SquareArrowOutUpRight className="cns-elements__icon cns-elements__icon-stroke" />
      );
    case "edit":
      return (
        <SquarePen className="cns-elements__icon cns-elements__icon-stroke" />
      );
  }
  return null;
}
