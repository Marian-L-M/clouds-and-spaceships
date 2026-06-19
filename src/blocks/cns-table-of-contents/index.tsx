import { registerCnsBlock } from "../../types/register-block";
import metadata from "./block.json";
import Edit, { type TocAttributes } from "./edit";
import "./style.scss";
import "./editor.scss";

registerCnsBlock<TocAttributes>(metadata.name, {
  edit: Edit,
  save: () => null,
});
