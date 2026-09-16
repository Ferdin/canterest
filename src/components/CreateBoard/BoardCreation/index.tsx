import { WalletCards } from "lucide-react";
import CreationIconWrapper from "../Wrappers/CreationIconWrapper";
import CreationWrapper from "../Wrappers/CreationWrapper";
import CreationColWrapper from "../Wrappers/CreationColWrapper";
import { useAppDispatch } from "../../../app/hooks";
import { closeMenu, openCreateBoardModal } from "../../../features/ui/uiSlice";

export default function BoardCreation() {
  const dispatch = useAppDispatch();
  
  return (
    <CreationWrapper 
      onClick={
        () => { 
          dispatch(openCreateBoardModal());
          dispatch(closeMenu());
        }
      }
    >
      <CreationIconWrapper>
        <WalletCards className="w-16 h-16 px-4" />
      </CreationIconWrapper>
      <CreationColWrapper>
        <h4 className="text-lg font-normal">Board</h4>
        <p className="text-sm text-gray-500">
          Organize a collection of your Pins by creating a board.
        </p>
      </CreationColWrapper>
    </CreationWrapper>
  );
}
