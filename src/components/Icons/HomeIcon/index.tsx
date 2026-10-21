import { House } from "lucide-react";
import IconsWrapper from "../IconsWrapper";
import Tooltip from "../../ToolTip";
import { Link } from "react-router-dom";

export default function HomeIcon() {
  return (
    <Tooltip content="Home" position="right">
    <IconsWrapper>
      <Link to="/" aria-label="Home">
        <House className="hover:bg-olive-300 w-10 h-10 px-2 rounded-md cursor-pointer" />
      </Link>
    </IconsWrapper>
    </Tooltip>
  );
}
