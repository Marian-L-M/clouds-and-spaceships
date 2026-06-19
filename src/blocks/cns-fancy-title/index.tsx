import { registerCnsBlock } from "../../types/register-block";
import "./style.scss";
import metadata from "./block.json";
import Edit, { type FancyTitleAttributes } from "./edit";
import save from "./save";

registerCnsBlock<FancyTitleAttributes>(metadata.name, { edit: Edit, save });
