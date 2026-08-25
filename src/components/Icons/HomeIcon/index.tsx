import { House } from "lucide-react";
import IconsWrapper from "../IconsWrapper";
import Tooltip from "../../ToolTip";

export default function HomeIcon() {
  return (
    <Tooltip content="Home" position="right">
    <IconsWrapper>
      <House className="hover:bg-olive-300 w-10 h-10 px-2 rounded-md cursor-pointer" />
    </IconsWrapper>
    </Tooltip>
  );
}
