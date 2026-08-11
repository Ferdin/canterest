import "./App.css";
import Board from "./components/Board";
import MainNav from "./components/MainNav";
import MainWrapper from "./components/MainWrapper";
import SideNav from "./components/SideNav";

function App() {
  return (
    <MainWrapper>
      <div className="flex-1">
        <SideNav />
      </div>
      <div className="w-[95%]">
        <MainNav />
        <Board />
      </div>
    </MainWrapper>
  );
}

export default App;
