import {
  registerBlockType,
  type BlockConfiguration,
  type BlockEditProps,
  type BlockSaveProps,
} from "@wordpress/blocks";
import type { ComponentType, ReactElement } from "react";

/**
 * The settings half of a block registration. Title, category and attributes
 * are provided by the adjacent `block.json` at runtime, so only `edit`/`save`
 * are supplied in code.
 */
export interface CnsBlockSettings<T extends Record<string, any>> {
  edit: ComponentType<BlockEditProps<T>>;
  save: (props: BlockSaveProps<T>) => ReactElement | null;
}

/**
 * Register a block by name, letting `block.json` provide the metadata.
 *
 * `@wordpress/blocks`' published types only model `registerBlockType` being
 * called with a full `BlockConfiguration`, not the metadata-name + partial
 * settings form that WordPress merges with `block.json`. This wrapper adapts
 * to the real runtime signature in one place so the call sites stay type-safe.
 */
export function registerCnsBlock<T extends Record<string, any>>(
  name: string,
  settings: CnsBlockSettings<T>,
): void {
  registerBlockType<T>(
    name as unknown as BlockConfiguration<T>,
    settings as unknown as Partial<BlockConfiguration<T>>,
  );
}
