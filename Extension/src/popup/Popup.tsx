import { useEffect, useState } from "react";
import { getToken } from "../api/client";
import LoginView from "./LoginView";
import AddBookmarkView from "./AddBookmarkView";

type AuthState = "loading" | "loggedOut" | "loggedIn";

const Popup = () => {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    getToken().then((token) => setAuthState(token ? "loggedIn" : "loggedOut"));
  }, []);

  if (authState === "loading") {
    return <div className="w-[360px] p-6 text-center text-sm text-gray-400">Loading…</div>;
  }

  if (authState === "loggedOut") {
    return <LoginView onSuccess={() => setAuthState("loggedIn")} />;
  }

  return <AddBookmarkView onSessionExpired={() => setAuthState("loggedOut")} />;
};

export default Popup;