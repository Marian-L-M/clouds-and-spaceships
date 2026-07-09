import { POSITIONS, getFlexValues } from "../lib/positions";

interface PositionPickerProps {
  value: string;
  onChange: (position: string) => void;
}

/** A 3×3 grid of buttons for picking one of the nine content anchors. */
export function PositionPicker({ value, onChange }: PositionPickerProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "4px",
        maxWidth: "120px",
        margin: "8px auto",
      }}
    >
      {POSITIONS.map((pos) => {
        const { alignItems: ai, justifyContent: jc } = getFlexValues(pos);
        const isActive = value === pos;
        return (
          <button
            key={pos}
            type="button"
            onClick={() => onChange(pos)}
            title={pos}
            style={{
              height: "36px",
              border: isActive ? "2px solid #007cba" : "1px solid #ddd",
              borderRadius: "2px",
              background: isActive ? "#007cba22" : "#f0f0f0",
              cursor: "pointer",
              display: "flex",
              alignItems: ai,
              justifyContent: jc,
              padding: "4px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isActive ? "#007cba" : "#bbb",
                display: "block",
                flexShrink: 0,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
