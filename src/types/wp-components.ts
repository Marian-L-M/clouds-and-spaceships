// Correctly-typed wrappers for `@wordpress/components` whose published types
// (@types/wordpress__components) are stale or missing relative to the WordPress
// version this theme targets:
//
//   • `ColorPicker` — DT still describes the legacy react-color API
//     (`onChangeComplete`/`disableAlpha`); WordPress now uses
//     `color`/`onChange`/`enableAlpha`.
//   • `BoxControl`  — not exported by DT at all, though it exists at runtime.
//   • `UnitControl` — exported at runtime as `__experimentalUnitControl`; not
//     present in DT.
//   • `RangeControl` — DT omits the runtime `withInputField` prop and the
//     `__next*` opt-in flags.
//
// The runtime components are unchanged; only their TypeScript surface is
// corrected here so call sites stay strictly typed.

import * as WPComponents from "@wordpress/components";
import { URLInput as RawURLInput } from "@wordpress/block-editor";
import type { ComponentType, ReactNode } from "react";
import type { BoxSides, SelectOption } from "./wordpress";

export interface ColorPickerProps {
  color?: string;
  onChange?: (value: string) => void;
  enableAlpha?: boolean;
  defaultValue?: string;
}

export const ColorPicker =
  WPComponents.ColorPicker as unknown as ComponentType<ColorPickerProps>;

export interface BoxControlProps {
  label?: string;
  /** The current spacing values. */
  values?: BoxSides;
  onChange?: (next: BoxSides) => void;
  sides?: Array<"top" | "right" | "bottom" | "left">;
  __next40pxDefaultSize?: boolean;
}

export const BoxControl = (
  WPComponents as unknown as { BoxControl: ComponentType<BoxControlProps> }
).BoxControl;

// `BorderBoxControl` — exported at runtime as `__experimentalBorderBoxControl`;
// not present in DT. Handles all-sides ("linked") and per-side ("unlinked")
// borders, each with color/style/width. The value is a flat `BorderValue` when
// linked, or a `SplitBorderValue` (top/right/bottom/left) when unlinked.
export interface BorderValue {
  color?: string;
  style?: string;
  width?: string;
}

export interface SplitBorderValue {
  top?: BorderValue;
  right?: BorderValue;
  bottom?: BorderValue;
  left?: BorderValue;
}

export type BorderBoxValue = BorderValue | SplitBorderValue;

export interface BorderBoxControlProps {
  label?: string;
  value?: BorderBoxValue;
  onChange?: (value?: BorderBoxValue) => void;
  colors?: Array<{ name: string; color: string; slug?: string }>;
  enableAlpha?: boolean;
  enableStyle?: boolean;
  __next40pxDefaultSize?: boolean;
}

export const BorderBoxControl = (
  WPComponents as unknown as {
    __experimentalBorderBoxControl: ComponentType<BorderBoxControlProps>;
  }
).__experimentalBorderBoxControl;

export interface UnitControlProps {
  label?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  units?: Array<{ value: string; label: string; default?: number }>;
  min?: number;
  placeholder?: string;
  disabled?: boolean;
  __next40pxDefaultSize?: boolean;
}

export const UnitControl = (
  WPComponents as unknown as {
    __experimentalUnitControl: ComponentType<UnitControlProps>;
  }
).__experimentalUnitControl;

export interface RangeControlProps {
  label?: string;
  hideLabelFromVision?: boolean;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  initialPosition?: number;
  withInputField?: boolean;
  allowReset?: boolean;
  onChange?: (value?: number) => void;
  disabled?: boolean;
  __next40pxDefaultSize?: boolean;
  __nextHasNoMarginBottom?: boolean;
}

export const RangeControl =
  WPComponents.RangeControl as unknown as ComponentType<RangeControlProps>;

// `SelectControl` is generic (`<T extends string | readonly string[]>`) and
// infers a literal-union value type from its `options`, so plain `string`
// attributes don't satisfy it. This theme only ever uses single, string-valued
// selects, so a `string`-typed surface is both simpler and correct.
export interface SelectControlProps {
  label?: string;
  hideLabelFromVision?: boolean;
  help?: ReactNode;
  value?: string;
  options?: SelectOption[];
  onChange?: (value: string) => void;
  disabled?: boolean;
  __next40pxDefaultSize?: boolean;
  __nextHasNoMarginBottom?: boolean;
}

export const SelectControl =
  WPComponents.SelectControl as unknown as ComponentType<SelectControlProps>;

// DT's `URLInput` Props omit `placeholder` (and the modern sizing flag), which
// the runtime component accepts.
export interface URLInputProps {
  value?: string;
  onChange?: (url: string, post?: unknown) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  __next40pxDefaultSize?: boolean;
}

export const URLInput =
  RawURLInput as unknown as ComponentType<URLInputProps>;
