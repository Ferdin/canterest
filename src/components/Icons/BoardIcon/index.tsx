import { WalletCards } from "lucide-react";
import IconsWrapper from "../IconsWrapper";
import { useDispatch } from "react-redux";
import { setActiveMenu } from "../../../features/ui/uiSlice";
import Tooltip from "../../ToolTip";

export default function BoardIcon() {
  const dispatch = useDispatch();
  return (
    <Tooltip content="Your boards" position="right">
      <IconsWrapper>
        <WalletCards
          className="hover:bg-olive-300 w-10 h-10 px-2 rounded-md cursor-pointer"
          onClick={() => dispatch(setActiveMenu("createBoard"))}
          />
      </IconsWrapper>
    </Tooltip>
  );
}
