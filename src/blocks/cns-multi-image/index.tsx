import { registerCnsBlock } from "../../types/register-block";
import "./style.scss";
import metadata from "./block.json";
import Edit, { type MultiImageAttributes } from "./edit";
import save from "./save";

registerCnsBlock<MultiImageAttributes>(metadata.name, { edit: Edit, save });
