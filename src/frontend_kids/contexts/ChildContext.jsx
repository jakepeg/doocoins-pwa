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
  const [init, setInit] = React.useState(true);
  const { actor, store, isAuthenticated } = useAuth();
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

  const refetchContent = ({ refetch, init }) => {
    if (init) {
      setInit(true);
    }
    if (refetch) {
      setRefetching(true);
    }
    const promises = [];

    // Get transactions
    const transactionsPromise = actor
      .getTransactions(child.id)
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
    const tasksPromise = actor.getTasks(child.id).then((returnedTasks) => {
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
      .getGoals(child.id)
      .then(async (returnedRewards) => {
        if ("ok" in returnedRewards) {
          const rewards = Object.values(returnedRewards)[0];
          let currentGoalId = await actor
            .getCurrentGoal(child.id)
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

    Promise.all(promises)
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
      });
  };

  useEffect(() => {
    if (actor && child?.id) {
      refetchContent({ init: true });
    }
  }, [actor, child?.id]);

  const getChildId = async () => {
    const childId = await get("selectedChild", store);
    if (!childId) setInit(false);

    return childId;
  };

  useEffect(() => {
    setChildData();
  }, [actor, isAuthenticated]);

  async function setChildData() {
    const childId = await getChildId();
    actor && childId && getBalance(childId).catch(console.error);
  }

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
    handleUpdateChild,
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
