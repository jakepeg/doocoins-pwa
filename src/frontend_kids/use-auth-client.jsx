import { AuthClient } from "@dfinity/auth-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../declarations/backend";
import { del } from "idb-keyval";

const AuthContext = createContext();

    const APPLICATION_NAME = "DooCoins";
    const APPLICATION_LOGO_URL = "https://nfid.one/icons/favicon-96x96.png";
    const AUTH_PATH = "/authenticate/?applicationName="+APPLICATION_NAME+"&applicationLogo="+APPLICATION_LOGO_URL+"#authorize";
    const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;

const defaultOptions = {
  /**
   *  @type {import("@dfinity/auth-client").AuthClientCreateOptions}
   */
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
      // idleTimeout: 1000 * 60 * 60 * 24 * 30, // 30 days
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  },
  /**
   * @type {import("@dfinity/auth-client").AuthClientLoginOptions}
   */
  // loginOptions: {
  //   identityProvider:
  //     process.env.DFX_NETWORK === "staging"
  //       ? "https://identity.ic0.app/#authorize"
  //       : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`,
  //       maxTimeToLive: BigInt (30) * BigInt(24) * BigInt(3_600_000_000_000),
  // },

  // loginOptions: {
  //   identityProvider:   process.env.DFX_NETWORK === "ic"
  //    ? NFID_AUTH_URL : NFID_AUTH_URL,
  //   maxTimeToLive: BigInt (30) * BigInt(24) * BigInt(3_600_000_000_000), // 30 days
  // },

  loginOptions: {
    identityProvider: NFID_AUTH_URL,
    maxTimeToLive: BigInt (30) * BigInt(24) * BigInt(3_600_000_000_000), // 30 days
  },
};

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
    setIsLoading(true)
    AuthClient.create(options.createOptions).then(async (client) => {
      updateClient(client);
    }).finally(() => {
      setIsLoading(false)
    });
  }, []);

  const login = () => {
    // TODO call checkMagiCode and return child id on success
    // authClient.login({
    //   ...options.loginOptions,
    //   onSuccess: () => {
    //     updateClient(authClient);
    //   },
    // });
    setIsAuthenticated(true)
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
