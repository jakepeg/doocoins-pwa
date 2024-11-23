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

function useWhyDidYouUpdate(name, props) {
  // create a reference to track the previous data
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      // merge the keys of previous and current data
      const keys = Object.keys({ ...previousProps.current, ...props });

      // to store what has change
      const changesObj = {};

      // check what values have changed between the previous and current
      keys.forEach((key) => {
        // if both are object
        if (
          typeof props[key] === "object" &&
          typeof previousProps.current[key] === "object"
        ) {
          if (
            JSON.stringify(previousProps.current[key]) !==
            JSON.stringify(props[key])
          ) {
            // add to changesObj
            changesObj[key] = {
              from: previousProps.current[key],
              to: props[key],
            };
          }
        } else {
          // if both are non-object
          if (previousProps.current[key] !== props[key]) {
            // add to changesObj
            changesObj[key] = {
              from: previousProps.current[key],
              to: props[key],
            };
          }
        }
      });

      // if changesObj not empty, print the cause
      if (Object.keys(changesObj).length) {
        console.log("This is causing re-renders", name, changesObj);
      }
    }

    // update the previous props with the current
    previousProps.current = props;
  });
}

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

  // useEffect(() => {
  //   console.log(`authenticatedAgent`, authenticatedAgent);
  //   if (authenticatedAgent) {
  //     setIsLoading(true);

  //     console.log("isLocal: ", isLocal);
  //     // const agent = new HttpAgent({
  //     //   host: isLocal ? "http://localhost:4943" : "https://icp-api.io",
  //     //   identity: identityKit.identity,
  //     //   verifyQuerySignatures: !isLocal,
  //     // });

  //     // const newActor = Actor.createActor(idlFactory, { agent, canisterId })
  //     const newActor = Actor.createActor(idlFactory, {
  //       agent: authenticatedAgent,
  //       canisterId,
  //     });

  //     setActor(newActor);
  //     setIsLoading(false);
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, [authenticatedAgent, isLocal]);

  useEffect(() => {
    async function initAgent() {
      if (authenticatedAgent) {
        setIsLoading(true);
        console.log("isLocal: ", isLocal);

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
    console.log(`not supposed to be here`);

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

  console.log(`main runs`, authValue);

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
