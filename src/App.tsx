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
import ProtectedRoute from "./components/ProtectedRoute";
import PinCreationTool from "./components/PinCreationTool";

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
      <Route path="/" element={token ? <AppLayout/> : <InitialLoginBox/>}/>
      <Route element={<ProtectedRoute/>}>
        <Route path="/pin-creation-tool" element={<PinCreationTool/>}/>
      </Route>
    </Routes>
  ) 
}

export default App;
