import React from "react";
import LoggedOut from "./LoggedOut";
import { useAuth, AuthProvider } from "./use-auth-client";
import "./assets/css/main.css";
import ChildList from "./ChildList";

function App() {
  const { isAuthenticated, identity } = useAuth();
  return (
    <>
      <header id="header">

      </header>
      <main id="pageContent">
        {isAuthenticated ? <ChildList /> : <LoggedOut />}
      </main>
    </>
  );
}

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
