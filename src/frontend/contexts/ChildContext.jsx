import React, { createContext } from "react";
import { useAuth } from "../use-auth-client";
import { del, get } from "idb-keyval";

export const ChildContext = createContext();

export default function ChildProvider({ children }) {
  const { actor } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedChild, setSelectedChild] = React.useState(null);

  const values = {
    
  };

  React.useEffect(() => {
    getChildren({ callService: false });
  }, [actor]);

  function getChildren({ callService = false }) {
    del("selectedChild");
    del("selectedChildName");
    setLoader(true);
    setLoader(true);
    actor
      ?.getChildren()
      .then(async (returnedChilren) => {
        if ("ok" in returnedChilren) {
          const children = Object.values(returnedChilren);
          const updatedChildrenData = await Promise.all(
            children[0].map(async (child) => {
              const balance = await getBalance(child.id);
              return {
                ...child,
                balance: parseInt(balance),
              };
            })
          );
          setChildren(updatedChildrenData);
          set("childList", updatedChildrenData);
        } else {
          console.error(returnedChilren.err);
        }
      })
      .finally(() => setLoader(false));
  }

  return (
    <>
      <todoContext.Provider value={values}>{children}</todoContext.Provider>
    </>
  );
}
