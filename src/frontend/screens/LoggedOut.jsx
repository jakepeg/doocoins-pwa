import React from "react";
import { useAuth } from "../use-auth-client";
import { Navigate } from "react-router-dom";

function LoggedOut() {
  const { login, isAuthenticated, isLoading } = useAuth();
  console.log(`LOG isAuthenticated`, isAuthenticated, `isLoading`, isLoading)
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container">
      <h1>Internet Identity Client</h1>
      <h2>You are not authenticated</h2>
      <p>To log in, click this button!</p>
      <button type="button" id="loginButton" onClick={login}>
        Log in
      </button>
    </div>
  );
}

export default LoggedOut;
