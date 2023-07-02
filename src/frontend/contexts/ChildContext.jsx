import React, { createContext } from "react";
import { useAuth } from "../use-auth-client";
import { del, get } from "idb-keyval";

export const ChildContext = createContext();

export default function ChildProvider({ children }) {
  const { actor } = useAuth();
  const [child, setChild] = React.useState(null);
 
  const getSelectedChild = async () => {
    let response;
    await get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([
        get(`balance-${data}`),
        get(`selectedChildName`),
      ]);
      if (data) {
        const selectedChild = {
          id: data,
          balance: parseInt(balance),
          name,
        };
        setChild(selectedChild);
      }
      response = data;
    });

    return response;
  }; 

  return (
    <>
      <ChildContext.Provider value={{ child, setChild, getSelectedChild }}>
        {children}
      </ChildContext.Provider>
    </>
  );
}
