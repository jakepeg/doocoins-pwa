import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../declarations/backend";
import { createStore, del, get } from "idb-keyval";

const AuthContext = createContext();

const store = createStore('db', 'kids');

export const useAuthClient = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true)
    const actor = createActor(canisterId);

    setActor(actor);
    get("selectedChild", store)
      .then((data) => {
        if (data) {
          setIsAuthenticated(true);
          return;
        }
        setIsAuthenticated(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (code) => {
    try {
      const data = await actor?.checkMagiCode(Number(code));
      if (data?.[0]) {
        setIsAuthenticated(true);
      } else {
        del("selectedChild");
        setIsAuthenticated(false);
      }
      return data?.[0];
    } catch (error) {
      setIsAuthenticated(false);
      return { error: error?.message };
    }
  };

  async function logout() {
    del("childList", store)
    del("childGoal", store)
    del("rewardList", store)
    del("selectedChild", store)
    del("selectedChildName", store)
    del("taskList", store)
    del("transactionList", store)

    setIsAuthenticated(false)
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
    store
  };
};

export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
