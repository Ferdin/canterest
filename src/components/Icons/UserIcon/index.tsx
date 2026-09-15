import { User } from "lucide-react";
import Tooltip from "../../ToolTip";
import { useAppSelector } from "../../../app/hooks";
import { Link } from "react-router-dom";

export default function UserIcon() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Tooltip content="Your Profile" position="bottom">
      <Link
        to={`/${user?.username}`}
      >
        <div className="flex items-center justify-center p-2 rounded-full bg-olive-100 hover:ring-4 hover:ring-olive-300 cursor-pointer">
          {user?.avatar_url ? (<img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full"/>) :(<User className="h-6 w-6 text-olive-700" />)}
        </div>
      </Link>
    </Tooltip>
  );
}
