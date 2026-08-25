import { ChevronDown } from "lucide-react";
import Tooltip from "../../ToolTip";

export default function ChevronDownIcon() {
  return (
    <Tooltip content="Accounts" position="bottom">
      <div className="items-center justify-center hover:bg-olive-300 hover:rounded-md cursor-pointer">
        <ChevronDown />
      </div>
    </Tooltip>
  );
}
