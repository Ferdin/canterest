import { Settings } from "lucide-react";
import IconsWrapper from "../IconsWrapper";

export default function GearIcon() {
  return (
    <IconsWrapper>
      <Settings className="hover:bg-olive-300 w-10 h-10 px-2 rounded-md cursor-pointer" />
    </IconsWrapper>
  );
}
