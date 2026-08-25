import { User } from "lucide-react";
import Tooltip from "../../ToolTip";

export default function UserIcon() {
  return (
    <Tooltip content="Your Profile" position="bottom">
      <div className="flex items-center justify-center p-2 rounded-full bg-olive-100 hover:ring-4 hover:ring-olive-300 cursor-pointer">
        <User className="h-6 w-6 text-olive-700" />
      </div>
    </Tooltip>
  );
}
