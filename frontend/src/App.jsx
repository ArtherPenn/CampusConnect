import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import NavBar from "./components/navBar.jsx";
import { useAuthStore } from "./store/useAuthStore.js";

import HomePage from "./pages/HomePage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import LogInPage from "./pages/LogInPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import EventNotification from "./components/EventNotification.jsx";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log("Auth User:", authUser);
  console.log("Online users:", onlineUsers);

  // Loading screen while checking authentication
  if (isCheckingAuth && authUser === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return ( 
    <div>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/logIn" />}
        ></Route>

        <Route
          path="/signIn"
          element={!authUser ? <SignInPage /> : <Navigate to="/" />}
        ></Route>

        <Route
          path="/logIn"
          element={!authUser ? <LogInPage /> : <Navigate to="/" />}
        ></Route>

        <Route path="/settings" element={<SettingsPage />}></Route>

        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/logIn" />}
        ></Route>
      </Routes>

      <Toaster />
      <EventNotification />
    </div>
  );
};

export default App;
