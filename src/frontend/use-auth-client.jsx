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
import { useIdentityKit } from "@nfid/identitykit/react";
import { useCallbackRef } from "@chakra-ui/react";
import { Actor } from "@dfinity/agent";
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
        if (typeof props[key] === "object" && typeof previousProps.current[key] === "object") {
          if (JSON.stringify(previousProps.current[key]) !== JSON.stringify(props[key])) {
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
  const identityKit = useIdentityKit();

  console.log(`identityKit`, identityKit);
  useEffect(() => {
    if (identityKit.agent) {
      // const newActor = createActor(canisterId, {
      //   // agentOptions: {
      //   //   identity: identityKit.identity,
      //   // },
      //   agent: identityKit.agent,
      // });
      const newActor = Actor.createActor(idlFactory, { agent: identityKit.agent, canisterId })
      console.log(`newActor`, newActor);
      
      setActor(newActor);
    }
    setIsLoading(false);
  }, [identityKit.agent]);

  const login = useCallback(() => {
    identityKit.connect();
  }, [identityKit]);

  const logout = useCallback(async () => {
    console.log(`not supposed to be here`);
    
    await identityKit.disconnect();
    del("childList");
    del("childGoal");
    del("rewardList");
    del("selectedChild");
    del("selectedChildName");
    del("taskList");
    del("transactionList");
  }, [identityKit]);

  const authValue = useMemo(() => {
    return {
      isAuthenticated: Boolean(identityKit?.accounts?.length),
      login,
      logout,
      identity: identityKit.identity,
      principal: identityKit.principal,
      actor,
      isLoading,
    };
  }, [
    identityKit.accounts,
    identityKit.identity,
    identityKit.principal,
    actor,
    isLoading,
    login,
    logout,
  ]);

  console.log(`main runs`, authValue);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
