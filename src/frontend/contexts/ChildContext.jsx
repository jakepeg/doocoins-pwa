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
  });

  const handleUpdateCalloutState = (entity, value) => {
    setIsNewToSystem((prevState) => ({ ...prevState, [entity]: value }));
    set(`${entity}Callout`, value);
  };

  useCheckIsUserNewToChildList({ handleUpdateCalloutState });
  useCheckIsUserNewToTasks({ handleUpdateCalloutState });
  useCheckIsUserNewToTransactions({ handleUpdateCalloutState });
  useCheckIsUserNewToSwipeActions({ handleUpdateCalloutState });

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

  const handleSetGoalLocally = async () => {
    let response;
    await get("childGoal").then(async (data) => {
      response = data;
      if (data) {
        setGoal({
          name: data.name,
          value: parseInt(data.value),
          hasGoal: data.hasGoal,
          ...data,
        });
      }
    });
    return response;
  };

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
      getSelectedChild,
      handleSetGoalLocally,
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
    getSelectedChild,
    handleSetGoalLocally,
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
