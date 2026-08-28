import { MessageCircleMore } from "lucide-react";
import IconsWrapper from "../IconsWrapper";
import { setActiveMenu } from "../../../features/ui/uiSlice";
import Tooltip from "../../ToolTip";
import { useAppDispatch } from "../../../app/hooks";

export default function MessageCircleIcon() {
  const dispatch = useAppDispatch();
  return (
    <Tooltip content="Messages" position="right">
      <IconsWrapper>
        <MessageCircleMore
          className="hover:bg-olive-300 w-10 h-10 px-2 rounded-md cursor-pointer"
          onClick={() => {
            dispatch(setActiveMenu("message"));
          }}
          />
      </IconsWrapper>
    </Tooltip>
  );
}
