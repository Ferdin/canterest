import { useSelector } from "react-redux";
import "./App.css";
import Board from "./components/Board";
import MainNav from "./components/MainNav";
import MainWrapper from "./components/MainWrapper";
import SideNav from "./components/SideNav";
import type { RootState } from "./app/store";
import ExpandBoard from "./components/ExpandBoard";

function App() {
  const activeMenu = useSelector((state: RootState) => state.ui.activeMenu);
  return (
    <MainWrapper>
      <div className={`flex-1`}>
        <SideNav />
      </div>
      {activeMenu && (
        <div className="flex-1">
          <ExpandBoard />
        </div>
      )}
      <div className={activeMenu ? `w-[70%]` : `w-[95%]`}>
        <MainNav />
        <Board />
      </div>
    </MainWrapper>
  );
}

export default App;
