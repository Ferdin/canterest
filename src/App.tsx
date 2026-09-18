import "./App.css";
import type { RootState } from "./app/store";
import Loading from "./components/MiscAnimatedComponents/Loading";
import InitialLoginBox from "./components/LoginComponents/InitialLoginBox";
import { useGetMeQuery } from "./features/auth/authApi";
import { logout, setUser } from "./features/auth/authSlice";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import PinCreationTool from "./components/PinCreationTool";
import Board from "./components/Board";
import UserProfile from "./components/UserProfile";
import UserProfilePins from "./components/UserProfile/UserProfilePins";
import UserProfileBoards from "./components/UserProfile/UserProfileBoards";
import UserProfileCollages from "./components/UserProfile/UserProfileCollages";

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state: RootState) => state.auth.token);

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

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loading/>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={token ? <AppLayout/> : <InitialLoginBox/>}>
        <Route index element={<Board/>}/>
        <Route path="pin-creation-tool" element={<PinCreationTool/>} />
        <Route path=":username" element={<UserProfile/>}>
          <Route index element={<UserProfilePins/>}/>
          <Route path="boards" element={<UserProfileBoards/>}/>
          <Route path="collages" element={<UserProfileCollages/>}/>
        </Route>
      </Route>
    </Routes>
  ) 
}

export default App;
