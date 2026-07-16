import { AlignmentMatrixControl } from "../../types/wp-components";

interface PositionPickerProps {
  value: string;
  onChange: (position: string) => void;
}

/**
 * Nine-anchor position picker on top of the native AlignmentMatrixControl.
 * Attributes keep the theme's `"<v>-<h>"` format (`middle` for the center
 * row); the control speaks `"<v> <h>"` with `center` — mapped here.
 */
function toMatrix(position: string): string {
  const [v = "bottom", h = "left"] = position.split("-");
  return `${v === "middle" ? "center" : v} ${h}`;
}

function fromMatrix(value: string): string {
  const [v = "bottom", h = "left"] = value.split(" ");
  return `${v === "center" ? "middle" : v}-${h}`;
}

export function PositionPicker({ value, onChange }: PositionPickerProps) {
  return (
    <AlignmentMatrixControl
      value={toMatrix(value)}
      onChange={(next) => onChange(fromMatrix(next))}
    />
  );
}
