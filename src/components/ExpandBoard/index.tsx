import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { closeMenu } from "../../features/ui/uiSlice";
import type { RootState } from "../../app/store";
import { menuTitles } from "../../features/ui/uiConfig";
import BoardWrapper from "../BoardWrapper";
import PinCreation from "../CreateBoard/PinCreation";
import BoardCreation from "../CreateBoard/BoardCreation";
import CollageCreation from "../CreateBoard/CollageCreation";
import Notifications from "../Notifications";

export default function ExpandBoard() {
  const dispatch = useDispatch();

  const activeMenu = useSelector((state: RootState) => state.ui.activeMenu);
  return (
    <div className="min-h-screen sticky top-0 bg-white border-r border-olive-300">
      <div className="flex justify-between items-center px-6 py-6 w-full">
        <h2 className="font-bold text-xl">
          {activeMenu ? menuTitles[activeMenu] : ""}
        </h2>
        <X
          className="cursor-pointer hover:bg-olive-300 hover:rounded-md"
          onClick={() => dispatch(closeMenu())}
        />
      </div>
      {activeMenu == "createBoard" && (
        <BoardWrapper>
          <PinCreation />
          <BoardCreation />
          <CollageCreation />
        </BoardWrapper>
      )}
      {activeMenu == "notification" && <Notifications />}
    </div>
  );
}
