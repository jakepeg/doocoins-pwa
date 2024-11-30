import { AuthClient } from "@dfinity/auth-client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { canisterId, createActor } from "../declarations/backend";
import { del } from "idb-keyval";
import {
  useAgent,
  useIdentityKit,
  useIdentity,
  useAuth as useNFIDAuth,
  useAccounts,
} from "@nfid/identitykit/react";
import { useCallbackRef } from "@chakra-ui/react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../declarations/backend";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLocal = process.env.NODE_ENV === "development";

  // const identityKit = useIdentityKit();
  const identity = useIdentity();
  const { connect, disconnect, isConnecting, user } = useNFIDAuth();
  const accounts = useAccounts();

  const authenticatedAgent = useAgent({
    host: isLocal ? "http://localhost:4943" : "https://icp-api.io",
    identity: identity,
    verifyQuerySignatures: !isLocal,
    fetchRootKey: isLocal,
  });

  useEffect(() => {
    async function initAgent() {
      if (authenticatedAgent) {
        setIsLoading(true);

        try {
          // Fetch root key if in local development
          if (isLocal) {
            await authenticatedAgent.fetchRootKey();
          }

          const newActor = Actor.createActor(idlFactory, {
            agent: authenticatedAgent,
            canisterId,
          });

          setActor(newActor);
        } catch (error) {
          console.error("Error initializing agent:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    initAgent();
  }, [authenticatedAgent, isLocal]);

  const login = useCallback(() => {
    // identityKit.connect();
    connect();
  }, [connect]);

  const logout = useCallback(async () => {
    // await identityKit.disconnect();
    await disconnect();
    del("childList");
    del("childGoal");
    del("rewardList");
    del("selectedChild");
    del("selectedChildName");
    del("taskList");
    del("transactionList");
  }, [disconnect]);

  const authValue = useMemo(() => {
    return {
      // isAuthenticated: !!identityKit.identity,
      isAuthenticated: !!identity,
      login,
      logout,
      // identity: identityKit.identity,
      identity: identity,
      // principal: identityKit.principal,
      princpal: accounts?.[0]?.principal,
      actor,
      isLoading,
    };
  }, [
    // identityKit.accounts,
    accounts,
    // identityKit.identity,
    identity,
    // identityKit.principal,
    accounts?.[0]?.principal,
    actor,
    isLoading,
    login,
    logout,
  ]);

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
