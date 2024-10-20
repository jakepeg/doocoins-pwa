import { AuthClient } from "@dfinity/auth-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../declarations/backend";
import { del } from "idb-keyval";

const AuthContext = createContext();
const APPLICATION_NAME = "DooCoins";
const APPLICATION_LOGO_URL = "https://nfid.one/icons/favicon-96x96.png";
const AUTH_PATH =
  "/authenticate/?applicationName=" +
  APPLICATION_NAME +
  "&applicationLogo=" +
  APPLICATION_LOGO_URL +
  "#authorize";
const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;

const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  },
  loginOptions: {
    identityProvider: NFID_AUTH_URL,
    maxTimeToLive: BigInt(30 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 30 days
  },
};

export const useAuthClient = (options = defaultOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authClient == null) {
      setIsLoading(true);
      AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 60 * 24 * 30,
          disableIdle: true,
          disableDefaultIdleCallback: true,
        },
      })
        .then(async (client) => {
          updateClient(client);
        })
        .finally(() => {});
    }
  }, []);

  const login = () => {
    authClient.login({
      ...options.loginOptions,
      onSuccess: () => {
        updateClient(authClient);
      },
    });
  };

  async function updateClient(client) {
    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);
    const identity = client.getIdentity();
    setIdentity(identity);
    const principal = identity.getPrincipal();
    setPrincipal(principal);
    setAuthClient(client);
    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
    setActor(actor);
    setIsLoading(false);
  }

  async function logout() {
    del("childList");
    del("childGoal");
    del("rewardList");
    del("selectedChild");
    del("selectedChildName");
    del("taskList");
    del("transactionList");
    if (authClient) {
      await authClient?.logout();
      await updateClient(authClient);
    }
  }

  return {
    isAuthenticated,
    login,
    logout,
    authClient,
    identity,
    principal,
    actor,
    isLoading,
  };
};

export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
