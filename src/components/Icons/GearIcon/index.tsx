import { Settings } from "lucide-react";
import IconsWrapper from "../IconsWrapper";
import { setActiveMenu } from "../../../features/ui/uiSlice";
import { useAppDispatch } from "../../../app/hooks";

export default function GearIcon() {
  const dispatch = useAppDispatch();

  return (
    <IconsWrapper>
      <Settings
        className="hover:bg-olive-300 w-10 h-10 px-2 rounded-md cursor-pointer"
        onClick={() => {
          dispatch(setActiveMenu("settings"));
        }}
      />
    </IconsWrapper>
  );
}
