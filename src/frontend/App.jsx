import React from "react";
import LoggedOut from "./screens/LoggedOut";
import { AuthProvider } from "./use-auth-client";

import "@nfid/identitykit/react/styles.css";
import { IdentityKitProvider } from "@nfid/identitykit/react";
import { IdentityKitAuthType, NFIDW } from "@nfid/identitykit";

import "./assets/css/main.css";
import ChildList from "./screens/ChildList";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./screens/Home";
import Rewards from "./screens/Rewards";
import Tasks from "./screens/Tasks";
import Wallet from "./screens/Wallet";
import NoMatch from "./screens/NoMatch";
import ProtectedRoute from "./ProtectedRoute";
import { ChakraProvider } from "@chakra-ui/react";
import About from "./screens/About";
import Help from "./screens/Help";
import ChildProvider from "./contexts/ChildContext";
import ImageLoader from "./utils/ImageLoader";
import InviteChild from "./screens/InviteChild";
import Alerts from "./screens/Alerts";
import { canisterId } from "../declarations/backend";

function App() {
  return (
    <main id="pageContent">
      <ImageLoader />
      <ChildProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChildList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invite"
              element={
                <ProtectedRoute>
                  <InviteChild />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoggedOut />} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </Router>
      </ChildProvider>
    </main>
  );
}

export default () => {
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const thirtyDaysInNs = BigInt(thirtyDaysInMs) * BigInt(1_000_000); // Convert to nanoseconds

  // const testTimeoutMs = 2 * 60 * 1000; // 2 minutes in milliseconds
  // const testTimeoutNs = BigInt(testTimeoutMs) * BigInt(1_000_000); // Convert to nanoseconds

  const testTimeoutMs = 10 * 60 * 1000; // 10 minutes in milliseconds
  const testTimeoutNs = BigInt(testTimeoutMs) * BigInt(1_000_000); // Convert to nanoseconds

  const clientOptions = {
    targets: [canisterId],
    idleOptions: {
      // Disable the default idle timeout behavior
      disableDefaultIdleCallback: false,
      // Set custom idle timeout
      idleTimeout: thirtyDaysInMs,
    },
    // Set delegation expiration to 30 days
    maxTimeToLive: thirtyDaysInNs,
    // Optional: Callback when logout occurs
    onLogout: () => {
      // Handle post-logout actions like redirecting to login page
      console.log("User logged out");
    },
  };

  const testClientOptions = {
    targets: [canisterId],
    idleOptions: {
      // Set idle timeout to 2 minutes for testing
      idleTimeout: testTimeoutMs,
      disableDefaultIdleCallback: false
    },
    // Set delegation expiration to 2 minutes
    maxTimeToLive: testTimeoutNs
  };

  return (
    <IdentityKitProvider
      onConnectSuccess={(res) => {
        console.log("logged in successfully", res);
        // return <Navigate to="/" replace />
      }}
      onDisconnect={(res) => {
        console.log("logged out successfully", res);
      }}
      signers={[NFIDW]}
      theme="light"
      signerClientOptions={clientOptions}
      authType={IdentityKitAuthType.Delegation}
    >
      <AuthProvider>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </AuthProvider>
    </IdentityKitProvider>
  );
};
