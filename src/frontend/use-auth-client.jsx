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
import MigrationStorage from "./utils/migrationStorage";

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

          // Store NFID principal for migration when authenticated
          if (accounts?.[0]?.principal && identity) {
            console.log("Storing NFID principal for migration:", accounts[0].principal);
            MigrationStorage.setNfidPrincipal(accounts[0].principal);
          } else {
            console.log("NFID principal not available yet - accounts:", accounts, "identity:", !!identity);
          }
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
  }, [authenticatedAgent, isLocal, accounts, identity]);

  // Separate effect to monitor accounts and store principal for migration
  useEffect(() => {
    console.log("useEffect - accounts changed:", accounts, "identity:", !!identity);
    
    // Try multiple approaches to get the principal
    let principal = null;
    
    // Approach 1: From accounts array
    if (accounts?.[0]?.principal) {
      principal = accounts[0].principal;
      console.log("Principal found in accounts:", principal);
    }
    
    // Approach 2: From identity object directly
    else if (identity?.getPrincipal) {
      try {
        principal = identity.getPrincipal().toString();
        console.log("Principal found from identity:", principal);
      } catch (error) {
        console.log("Error getting principal from identity:", error);
      }
    }
    
    // Approach 3: From user object if available
    else if (user?.principal) {
      principal = user.principal;
      console.log("Principal found in user object:", principal);
    }
    
    // Store the principal if we found one
    if (principal && !MigrationStorage.getNfidPrincipal()) {
      console.log("Storing NFID principal for migration:", principal);
      MigrationStorage.setNfidPrincipal(principal);
    }
  }, [accounts, identity, user]);

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
    // Debug logging for auth state
    if (identity) {
      console.log("Auth state debug:", {
        identity: !!identity,
        accounts,
        user,
        isConnecting,
        accountPrincipal: accounts?.[0]?.principal,
        userPrincipal: user?.principal
      });
    }
    
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
    user,
    isConnecting,
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
