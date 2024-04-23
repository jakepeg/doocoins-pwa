import React, { createContext } from "react";
import { useAuth } from "../use-auth-client";
import { get, set } from "idb-keyval";
import strings, { noGoalEntity } from "../utils/constants";
import useCheckIsUserNewToChildList from "../hooks/useCheckIsUserNewToChildList";
import useCheckIsUserNewToTasks from "../hooks/useCheckIsUserNewToTasks";
import useCheckIsUserNewToTransactions from "../hooks/useCheckIsUserNewToTransactions";
import useCheckIsUserNewToSwipeActions from "../hooks/useCheckIsUserNewToSwipeActions";

export const ChildContext = createContext();

export default function ChildProvider({ children }) {
  const { actor } = useAuth();
  const [child, setChild] = React.useState(null);
  const [goal, setGoal] = React.useState(null);
  const [blockingChildUpdate, setBlockingChildUpdate] = React.useState(false);
  const [transactions, setTransactions] = React.useState([]);
  const [isNewToSystem, setIsNewToSystem] = React.useState({
    [strings.CALLOUTS_CHILD_LIST]: false,
    [strings.CALLOUTS_TASKS]: false,
    [strings.CALLOUT_NO_TRANSACTIONS]: false,
    wallet: false,
    [strings.CALLOUT_REWARDS_LIST]: false,
    [strings.CALLOUT_TASKS_LIST]: false,
    [strings.CALLOUTS_REWARDS]: false,
  });

  const handleUpdateCalloutState = (entity, value) => {
    setIsNewToSystem((prevState) => ({ ...prevState, [entity]: value }));
    set(`${entity}Callout`, value);
  };

  useCheckIsUserNewToChildList({ handleUpdateCalloutState });
  useCheckIsUserNewToTasks({ handleUpdateCalloutState });
  useCheckIsUserNewToTransactions({ handleUpdateCalloutState });
  useCheckIsUserNewToSwipeActions({ handleUpdateCalloutState });

  async function getBalance(childID) {
    return new Promise((resolve, reject) => {
      get("balance-" + childID)
        .then((val) => {
          actor?.getBalance(childID).then((returnedBalance) => {
            set("balance-" + childID, parseInt(returnedBalance));
            resolve(returnedBalance);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  const handleUnsetGoal = () => {
    actor?.currentGoal(child.id, 0).then(async (returnedCurrentGoal) => {});
    setGoal(noGoalEntity);
    set("childGoal", noGoalEntity);
  };

  const values = React.useCallback(() => {
    return {
      child,
      setChild,
      goal,
      setGoal,
      getBalance,
      handleUnsetGoal,
      isNewToSystem,
      handleUpdateCalloutState,
      setBlockingChildUpdate,
      blockingChildUpdate,
      setTransactions,
      transactions
    };
  }, [
    child,
    setChild,
    goal,
    setGoal,
    getBalance,
    handleUnsetGoal,
    isNewToSystem,
    handleUpdateCalloutState,
    blockingChildUpdate,
    setBlockingChildUpdate,
    setTransactions,
    transactions
  ]);

  return (
    <>
      <ChildContext.Provider value={values()}>{children}</ChildContext.Provider>
    </>
  );
}
