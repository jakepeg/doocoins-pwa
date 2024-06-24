import React, { createContext, useEffect } from "react";
import { useAuth } from "../use-auth-client";
import { get, set } from "idb-keyval";
import strings, { noGoalEntity } from "../utils/constants";
import useCheckIsUserNewToChildList from "../hooks/useCheckIsUserNewToChildList";
import useCheckIsUserNewToTasks from "../hooks/useCheckIsUserNewToTasks";
import useCheckIsUserNewToTransactions from "../hooks/useCheckIsUserNewToTransactions";
import useCheckIsUserNewToSwipeActions from "../hooks/useCheckIsUserNewToSwipeActions";

export const ChildContext = createContext();

export default function ChildProvider({ children }) {
  const [init, setInit] = React.useState(true);
  const { actor, store } = useAuth();
  const [child, setChild] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [rewards, setRewards] = React.useState([]);
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
    set(`${entity}Callout`, value, store);
  };

  useCheckIsUserNewToChildList({ handleUpdateCalloutState });
  useCheckIsUserNewToTasks({ handleUpdateCalloutState });
  useCheckIsUserNewToTransactions({ handleUpdateCalloutState });
  useCheckIsUserNewToSwipeActions({ handleUpdateCalloutState });

  const handleUpdateChild = (...args) => {
    setChild((prevState) => ({ ...prevState, ...args?.[0] }));
  };

  async function getBalance(childID) {
    return new Promise((resolve, reject) => {
      get("balance-" + childID, store)
        .then((val) => {
          actor?.getBalance(childID).then(async (returnedBalance) => {
            set("balance-" + childID, parseInt(returnedBalance), store);

            const [balance, name] = await Promise.all([
              get(`balance-${childID}`, store),
              get(`selectedChildName`, store),
            ]);

            setChild({
              id: childID,
              balance: parseInt(balance),
              name,
            });
            console.log(`balance`, balance, name);

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
    set("childGoal", noGoalEntity, store);
  };

  useEffect(() => {
    // call all the apis and update memory on mount
    if (actor) {
      // Get transactions
      child?.id &&
        actor?.getTransactions(child?.id).then((returnedTransactions) => {
          if ("ok" in returnedTransactions) {
            const transactions = Object.values(returnedTransactions);
            if (transactions.length) {
              set("transactionList", transactions[0], store);
              setTransactions(transactions?.[0]);
            }
          } else {
            console.error(returnedTransactions.err);
            set("transactionList", undefined, store);
          }
        });

      // Update child balance
      child?.id && getBalance(child?.id);

      // Get Tasks
      child?.id &&
        actor?.getTasks(child?.id).then((returnedTasks) => {
          if ("ok" in returnedTasks) {
            const tasks = Object.values(returnedTasks);
            const filteredTasks = tasks?.[0]?.map((task) => {
              return {
                ...task,
                id: parseInt(task.id),
                value: parseInt(task.value),
              };
            });
            set("taskList", filteredTasks, store);
            setTasks(filteredTasks || []);
          } else {
            console.error(returnedTasks.err);
          }
        });

      // Get Rewards
      child?.id &&
        actor?.getGoals(child.id).then(async (returnedRewards) => {
          if ("ok" in returnedRewards) {
            const rewards = Object.values(returnedRewards);
            let currentGoalId;
            await actor?.getCurrentGoal(child.id).then((returnedGoal) => {
              currentGoalId = parseInt(returnedGoal);

              return currentGoalId;
            });
            const filteredRewards = rewards?.[0].map((reward) => {
              return {
                ...reward,
                value: parseInt(reward.value),
                id: parseInt(reward.id),
                active: currentGoalId === parseInt(reward.id),
              };
            });
            set("rewardList", filteredRewards, store);
            setRewards(filteredRewards);
          } else {
            console.error(returnedRewards.err);
          }
        });
    }
  }, [actor, child?.id]);

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
      transactions,
      handleUpdateChild,
      setTasks,
      tasks,
      setRewards,
      rewards,
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
    transactions,
    handleUpdateChild,
    setTasks,
    tasks,
    setRewards,
    rewards,
  ]);

  return (
    <ChildContext.Provider value={values()}>{children}</ChildContext.Provider>
  );
}
