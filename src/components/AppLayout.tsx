import { useAppSelector } from "../app/hooks";
import Board from "./Board";
import ExpandBoard from "./ExpandBoard";
import MainNav from "./MainNav";
import MainWrapper from "./MainWrapper";
import SideNav from "./SideNav";

export default function AppLayout() {
    const activeMenu = useAppSelector((state) => state.ui.activeMenu);

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
                <Board />
            </div>
        </MainWrapper>
    )
}