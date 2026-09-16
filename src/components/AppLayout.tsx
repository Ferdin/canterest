import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import ExpandBoard from "./ExpandBoard";
import MainNav from "./MainNav";
import MainWrapper from "./MainWrapper";
import SideNav from "./SideNav";
import CreateBoardModal from "./CreateBoardModal";
import { closeCreateBoardModal } from "../features/ui/uiSlice";

export default function AppLayout() {
    const activeMenu = useAppSelector((state) => state.ui.activeMenu);
    const isCreateBoardOpen = useAppSelector((state) => state.ui.isCreateBoardOpen);
    const dispatch = useAppDispatch();

    return (
        <MainWrapper>
            <SideNav />
            {activeMenu && (
                <div className="flex-1">
                    <ExpandBoard />
                </div>
            )}
            <div className={`${activeMenu ? `w-[70%]` : `w-full`} transition`}>
                <MainNav />
                <Outlet />
            </div>

            <CreateBoardModal
                isOpen={isCreateBoardOpen}
                onClose={() => dispatch(closeCreateBoardModal())}
            />    
        </MainWrapper>
    )
}