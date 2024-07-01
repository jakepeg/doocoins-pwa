import { AuthClient } from "@dfinity/auth-client";
import { NFID } from "@nfid/embed"
import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../declarations/backend";
import { del } from "idb-keyval";

const AuthContext = createContext();

type IdleOptions = {
  onIdle?: () => unknown; // callback after the user has gone idle
  idleTimeout?: number; // timeout in ms, default is 600000 (10 minutes)
  captureScroll?: boolean; // capture scroll events
  scrollDebounce?: number; // scroll debounce time in ms, default is 100
  disableIdle?: boolean; // disables idle functionality
  disableDefaultIdleCallback?: boolean; // disables default idle behavior - call logout & reload window
}
 
type NFIDConfig = {
  origin?: string; // default is "https://nfid.one"
  application?: { // your application details to display in the NFID iframe
    name?: DooCoins; // your app name user can recognize
    logo?: string; // your app logo user can recognize
  };
  identity?: SignIdentity;
  storage?: AuthClientStorage;
  keyType?: "ECDSA" | "Ed25519" // default is "ECDSA"
  idleOptions?: IdleOptions;
};
 
const nfid = await NFID.init({
  application: {
    name: "My Sweet App",
    logo: "https://dev.nfid.one/static/media/id.300eb72f3335b50f5653a7d6ad5467b3.svg"
  },
}: NFIDConfig);

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
