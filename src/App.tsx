import { useSelector } from "react-redux";
import "./App.css";
import Board from "./components/Board";
import MainNav from "./components/MainNav";
import MainWrapper from "./components/MainWrapper";
import SideNav from "./components/SideNav";
import type { RootState } from "./app/store";
import ExpandBoard from "./components/ExpandBoard";
import { useAuth } from "./hooks/useAuth";
import Loading from "./components/MiscAnimatedComponents/Loading";

function App() {
  const activeMenu = useSelector((state: RootState) => state.ui.activeMenu);
  const { authorized, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#121212]">
        <Loading/>
      </div>
    )
  }

  return authorized ? (
    <MainWrapper>
      {/**
       * Auth manifestation happens here:
       */}
      <div className={``}>
        <SideNav />
      </div>
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
  ) : (
    <div className="fixed inset-0 bg-black/50">

    </div>
  )
}

export default App;
