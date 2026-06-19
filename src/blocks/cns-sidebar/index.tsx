import { registerCnsBlock } from "../../types/register-block";
import metadata from "./block.json";
import Edit, { type SidebarAttributes } from "./edit";
import "./style.scss";
import "./editor.scss";

registerCnsBlock<SidebarAttributes>(metadata.name, {
  edit: Edit,
  save: () => null,
});
