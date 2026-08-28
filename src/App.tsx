import "./App.css";
import Board from "./components/Board";
import MainNav from "./components/MainNav";
import MainWrapper from "./components/MainWrapper";
import SideNav from "./components/SideNav";
import type { RootState } from "./app/store";
import ExpandBoard from "./components/ExpandBoard";
import Loading from "./components/MiscAnimatedComponents/Loading";
import InitialLoginBox from "./components/LoginComponents/InitialLoginBox";
import { useGetMeQuery } from "./features/auth/authApi";
import { logout, setUser } from "./features/auth/authSlice";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const activeMenu = useAppSelector((state: RootState) => state.ui.activeMenu);

  // skip the call entirely if there's no token - same short-circuit as before
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (data?.authorized) {
      dispatch(setUser(data.user));
    } else if (isError || (data && !data.authorized)) {
      dispatch(logout());
    }
  }, [data, isError, dispatch]);

  const loading = !!token && isLoading;
  const authorized = !!token && !!data?.authorized;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
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
    <InitialLoginBox/>
  )
}

export default App;
