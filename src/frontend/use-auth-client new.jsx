import { AuthClient } from "@dfinity/auth-client";
import { NFID } from "@nfid/embed"
import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../declarations/backend";
import { del } from "idb-keyval";

const AuthContext = createContext();

/**
 *
 * @param options - Options for the AuthClient
 * @param {AuthClientCreateOptions} options.createOptions - Options for the AuthClient.create() method
 * @param {AuthClientLoginOptions} options.loginOptions - Options for the AuthClient.login() method
 * @returns
 */
export const useAuthClient = (options = defaultOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize AuthClient
    if (authClient == null) {
      setIsLoading(true)
      AuthClient.create().then(async (client) => {
        updateClient(client);
      }).finally(() => {
        setIsLoading(false)
      });
    }
  }, []);

  const login = () => {
    console.log(`authClient`, authClient);
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
    console.log(`identity`, identity);
    setIdentity(identity);

    const principal = identity.getPrincipal();
    setPrincipal(principal);

    setAuthClient(client);

    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });

    console.log(`actor`, actor);

    setActor(actor);
  }

  async function logout() {
    del("childList")
    del("childGoal")
    del("rewardList")
    del("selectedChild")
    del("selectedChildName")
    del("taskList")
    del("transactionList")
    if(authClient) {
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
    isLoading
  };
};

/**
 * @type {React.FC}
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
