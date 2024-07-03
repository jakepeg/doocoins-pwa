import React, { createContext, useEffect, useState } from "react";
import { useAuth } from "../use-auth-client";
import { get, set } from "idb-keyval";
import strings, { noGoalEntity } from "../utils/constants";
import useCheckIsUserNewToChildList from "../hooks/useCheckIsUserNewToChildList";
import useCheckIsUserNewToTasks from "../hooks/useCheckIsUserNewToTasks";
import useCheckIsUserNewToTransactions from "../hooks/useCheckIsUserNewToTransactions";
import useCheckIsUserNewToSwipeActions from "../hooks/useCheckIsUserNewToSwipeActions";
import { Box, useToast } from "@chakra-ui/react";
import LoadingSpinner from "../components/LoadingSpinner";

export const ChildContext = createContext();

export default function ChildProvider({ children }) {
  const [init, setInit] = React.useState(false);
  const { actor, store, isAuthenticated, isLoading } = useAuth();
  const [refetching, setRefetching] = useState(false);
  const toast = useToast();
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

  async function getBalance(childID) {
    return new Promise((resolve, reject) => {
      get("balance-" + childID, store)
        .then((val) => {
          actor?.getBalance(childID).then(async (returnedBalance) => {
            set("balance-" + childID, parseInt(returnedBalance), store);

            const [name] = await Promise.all([get(`selectedChildName`, store)]);

            setChild({
              id: childID,
              balance: parseInt(returnedBalance),
              name,
            });

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

  const refetchContent = async ({ refetch, init, childId }) => {
    const child_id = childId || child?.id
    let response;
    if (init) {
      setInit(true);
    }
    if (refetch) {
      setRefetching(true);
    }
    const promises = [];

    // Get transactions
    const transactionsPromise = actor
      .getTransactions(child_id)
      .then((returnedTransactions) => {
        if ("ok" in returnedTransactions) {
          const transactions = Object.values(returnedTransactions)[0];
          set("transactionList", transactions, store);
          setTransactions(transactions);
        } else {
          console.error(returnedTransactions.err);
          set("transactionList", undefined, store);
        }
      });

    promises.push(transactionsPromise);

    // Get Tasks
    const tasksPromise = actor.getTasks(child_id).then((returnedTasks) => {
      if ("ok" in returnedTasks) {
        const tasks = Object.values(returnedTasks)[0];
        const filteredTasks = tasks.map((task) => ({
          ...task,
          id: parseInt(task.id),
          value: parseInt(task.value),
        }));
        set("taskList", filteredTasks, store);
        setTasks(filteredTasks);
      } else {
        console.error(returnedTasks.err);
      }
    });

    promises.push(tasksPromise);

    // Get Rewards
    const rewardsPromise = actor
      .getGoals(child_id)
      .then(async (returnedRewards) => {
        if ("ok" in returnedRewards) {
          const rewards = Object.values(returnedRewards)[0];
          let currentGoalId = await actor
            .getCurrentGoal(child_id)
            .then((returnedGoal) => parseInt(returnedGoal));

          const filteredRewards = rewards.map((reward) => ({
            ...reward,
            value: parseInt(reward.value),
            id: parseInt(reward.id),
            active: currentGoalId === parseInt(reward.id),
          }));
          set("rewardList", filteredRewards, store);
          setRewards(filteredRewards);
        } else {
          console.error(returnedRewards.err);
        }
      });
    promises.push(rewardsPromise);

    const balance = actor
      ?.getBalance(child_id)
      .then(async (returnedBalance) => {
        setChild((prevState) => ({ ...prevState, balance: parseInt(returnedBalance) }));
      });

    promises.push(balance);

    const goals = actor?.getGoals(child_id).then(async (returnedRewards) => {
      if ("ok" in returnedRewards) {
        const rewards = Object.values(returnedRewards);
        let currentGoalId;
        await actor?.getCurrentGoal(child_id).then((returnedGoal) => {
          currentGoalId = parseInt(returnedGoal);

          return currentGoalId;
        });

        if (rewards) {
          const reward = rewards?.[0]?.find(
            (reward) => currentGoalId === parseInt(reward.id)
          );

          if (reward) {
            const { name, value, id } = reward;
            const returnedGoal = {
              name,
              value: parseInt(value),
              hasGoal: true,
              id,
            };
            set("childGoal", returnedGoal, store);
            setGoal(returnedGoal);
          }
        }
        const filteredRewards = rewards?.[0].map((reward) => {
          return {
            ...reward,
            value: parseInt(reward.value),
            id: parseInt(reward.id),
            active: currentGoalId === parseInt(reward.id) ? true : false,
          };
        });
        set("rewardList", filteredRewards, store);
      } else {
        set("childGoal", noGoalEntity, store);
        setGoal(noGoalEntity);
        console.error(returnedRewards.err);
      }
    });

    promises.push(goals);

    await Promise.all(promises)
      .then(() => {
        if (init) {
          setInit(false);
        }
        if (refetch) {
          setRefetching(false);
        }
      })
      .catch((error) => {
        toast({
          title: "An error occurred.",
          description: `Could not fetch kids details.`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        if (init) {
          setInit(false);
        }
        if (refetch) {
          setRefetching(false);
        }
      })
      .finally(() => {
        response = {};
      });

    return response;
  };

  const getChildId = async () => {
    const childId = await get("selectedChild", store);
    if (!childId) setInit(false);

    return childId;
  };

  async function setChildDataFromLocalStorage() {
    const childId = await getChildId();

    if (!childId) {
      return;
    }
  
    const [balance, childName] = await Promise.all([
      get(`balance-${childId}`, store),
      get("selectedChildName", store),
    ]);

    // Create a new state object to set all at once
    const newState = {};
  
    if (balance !== undefined) {
      newState.balance = parseInt(balance);
    }
    if (childName !== undefined) {
      newState.name = childName;
    }
    newState.id = childId; // childId is always defined here
  
    // Update state once with the new state object
    setChild((prevState) => ({
      ...prevState,
      ...newState,
    }));
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setChildDataFromLocalStorage()
    }
  }, [isLoading])

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
      setTasks,
      tasks,
      setRewards,
      rewards,
      refetchContent,
      refetching,
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
    setTasks,
    tasks,
    setRewards,
    rewards,
    refetchContent,
    refetching,
  ]);

  if (init) {
    return (
      <Box
        minHeight={"100vh"}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <ChildContext.Provider value={values()}>{children}</ChildContext.Provider>
  );
}
