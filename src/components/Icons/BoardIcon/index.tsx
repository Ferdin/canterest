import { WalletCards } from "lucide-react";
import IconsWrapper from "../IconsWrapper";
import Tooltip from "../../ToolTip";
import { useAppSelector } from "../../../app/hooks";
import { Link } from "react-router-dom";

export default function BoardIcon() {
  const username = useAppSelector((state) => state.auth.user?.username)

  if(!username) return null;

  return (
    <Tooltip content="Your boards" position="right">
      <IconsWrapper>
        <Link to={`/${username}/boards`} aria-label="Your boards">
          <WalletCards
            className="hover:bg-olive-300 w-10 h-10 px-2 rounded-md cursor-pointer"
          />
        </Link>
      </IconsWrapper>
    </Tooltip>
  );
}
