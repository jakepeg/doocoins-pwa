import React from "react";
import { ChildContext } from "../contexts/ChildContext";

const useClearContextState = () => {
  const { setChild, setGoal } = React.useContext(ChildContext);
  const clearContextState = () => {
    setGoal(null);
    setChild(null);
  };
  return clearContextState;
};

export default useClearContextState;
