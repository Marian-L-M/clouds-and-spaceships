import { InnerBlocks } from "@wordpress/block-editor";
import { registerCnsBlock } from "../../types/register-block";
import metadata from "./block.json";
import Edit, { type SlideshowAttributes } from "./edit";
import "./style.scss";
import "./editor.scss";

registerCnsBlock<SlideshowAttributes>(metadata.name, {
  edit: Edit,
  save: () => <InnerBlocks.Content />,
});
