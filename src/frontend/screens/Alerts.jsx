import React, { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { ChildContext } from "../contexts/ChildContext";
import { del, get, set } from "idb-keyval";
import { useToast, Text } from "@chakra-ui/react";
import { useAuth } from "../use-auth-client";
import {
  SwipeableList,
  Type as ListType,
  SwipeAction,
  TrailingActions,
  SwipeableListItem,
} from "react-swipeable-list";
import { ReactComponent as ApproveIcon } from "../assets/images/tick.svg";
import { ReactComponent as DeleteIcon } from "../assets/images/delete.svg";
import RequestAlert from "../../frontend_kids/components/Tasks/RequestAlert";
import useHasRewards from "../hooks/useHasRewards";

const Alerts = () => {
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const {
    child,
    setChild,
    getBalance,
    transactions,
    setTransactions,
    setBlockingChildUpdate,
    list, 
    setList
  } = React.useContext(ChildContext);
  const { actor } = useAuth();
  const { hasNewData } = useHasRewards(child?.id, false)

  React.useEffect(() => {
    if (!child) {
      setLoading(false);
    }
  }, [child]);

  React.useEffect(() => {
    if (child && hasNewData) {
      getAlerts({ callService: true });
    }
  }, [actor, child, hasNewData]);

  function getAlerts({
    disableFullLoader = false,
    callService = false,
    revokeStateUpdate = false,
  }) {
    if (child.id) {
      if (!disableFullLoader) {
        setLoading(true);
      }
      get("tasksReq")
        .then(async (val) => {
          if (val === undefined || callService) {
            actor?.getTaskReqs(child.id).then(async (returnedTasksReq) => {
              const tasksReq = Object.values(returnedTasksReq);
              set("tasksReq", tasksReq);
              setList((prevState) => ({
                ...prevState,
                tasks: tasksReq,
              }));

              setLoading(false);
            });
          } else {
            if (!revokeStateUpdate) {
              setList((prevState) => ({
                ...prevState,
                tasks: val?.map((task) => {
                  return {
                    ...task,
                    id: parseInt(task.id),
                    value: parseInt(task.value),
                  };
                }),
              }));
            }
            setLoading(false);
          }
        })
        .catch((error) => {
          removeErrorItem();
        });

      get("rewardsReq")
        .then(async (val) => {
          if (val === undefined || callService) {
            actor?.getRewardReqs(child.id).then(async (returnedRewardsReq) => {
              set("rewardsReq", returnedRewardsReq);
              setList((prevState) => ({
                ...prevState,
                rewards: returnedRewardsReq,
              }));
              setLoading(false);
            });
          } else {
            if (!revokeStateUpdate) {
              setList((prevState) => ({
                ...prevState,
                rewards: val?.map((reward) => {
                  return {
                    ...reward,
                    id: parseInt(reward.id),
                    value: parseInt(reward.value),
                  };
                }),
              }));
            }
            setLoading(false);
          }
        })
        .catch((error) => {
          removeRewardsErrorItem();
        });

      return false;
    }
  }

  const removeErrorItem = () => {
    if (list.tasks?.length) {
      toast({
        title: "An error occurred.",
        description: `Apologies, please try again later.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      const finalTasks = list.tasks.filter((reward) => !reward?.isLocal);
      set("tasksReq", finalTasks);
      setList((prevState) => ({ ...prevState, tasks: finalTasks }));
    } else {
      del("tasksReq", undefined);
      setList((prevState) => ({ ...prevState, tasks: [] }));
    }
  };

  const removeRewardsErrorItem = () => {
    if (list.tasks?.length) {
      toast({
        title: "An error occurred.",
        description: `Apologies, please try again later.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      const rewardsTasks = list.rewards.filter((reward) => !reward?.isLocal);
      set("rewardsReq", rewardsTasks);
      setList((prevState) => ({ ...prevState, rewards: rewardsTasks }));
    } else {
      del("rewardsReq", undefined);
      setList((prevState) => ({ ...prevState, rewards: [] }));
    }
  };

  const getChildren = async ({ revokeStateUpdate = false }) => {
    await get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([
        get(`balance-${data}`),
        get(`selectedChildName`),
      ]);
      if (data) {
        if (!revokeStateUpdate) {
          setChild({
            id: data,
            balance: parseInt(balance),
            name,
          });
        }
      } else {
        navigate("/");
      }
    });
  };

  const handleUpdateTransactions = (transactions) => {
    setTransactions(transactions);
    set("transactionList", transactions);
  };

  const approveRequest = async ({ task, reward }) => {
    setLoading(true);
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();

    if (task) {
      let maxIdObject = null;

      // Iterate through the data array to find the object with the highest "id"
      for (const item of transactions) {
        if (!maxIdObject || Number(item.id) > Number(maxIdObject.id)) {
          maxIdObject = item;
        }
      }

      const new_transactions = {
        completedDate: date,
        id: maxIdObject?.id ? parseInt(maxIdObject?.id) + 1 : 1,
        value: task.value,
        name: task.name,
        transactionType: "TASK_CREDIT",
      };
      setChild((prevState) => ({
        ...prevState,
        balance: prevState.balance + task.value,
      }));
      set("transactionList", [new_transactions, ...transactions]);
      setTransactions([new_transactions, ...transactions]);
      // API call approveTask
      setBlockingChildUpdate(true);

      try {
        await actor
          .approveTask(task.childId, parseInt(task.taskId), date)
          .then((returnedApproveTask) => {
            if ("ok" in returnedApproveTask) {
              actor?.getChildren().then(async (returnedChilren) => {
                if ("ok" in returnedChilren) {
                  toast({
                    title: `Keep up the good work, ${child.name}.`,
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                  });
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
                  set("childList", updatedChildrenData);
                  await getChildren({ revokeStateUpdate: true });
                  // setLoader((prevState) => ({ ...prevState, init: false }));
                  setBlockingChildUpdate(false);
                } else {
                  // setLoader((prevState) => ({ ...prevState, init: false }));
                  console.error(returnedChilren.err);
                }
              });
            } else {
              // setLoader((prevState) => ({ ...prevState, init: false }));
              const filteredTransactions = transactions.filter(
                (transaction) => transaction.id !== new_transactions.id
              );
              setTransactions(filteredTransactions);
              setChild((prevState) => ({
                ...prevState,
                balance: prevState.balance - task.value,
              }));
              set("transactionList", filteredTransactions);
              console.error(returnedApproveTask.err);
              setBlockingChildUpdate(false);
            }
          });
        toast({
          title: `Approved`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        getAlerts({ callService: true });
      } catch (error) {
        toast({
          title: "An error occurred.",
          description: `Apologies, please try again later.`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
        console.log(`error block`, error);
      }
    } else if (reward) {
      const new_transactions = {
        completedDate: date,
        id: transactions?.[0]?.id ? parseInt(transactions?.[0]?.id) + 1 : 1,
        value: reward.value,
        name: reward.name,
        transactionType: "GOAL_DEBIT",
      };
      handleUpdateTransactions([new_transactions, ...transactions]);

      setChild((prevState) => ({
        ...prevState,
        balance: prevState.balance - reward.value,
      }));

      try {
        await actor
          .claimGoal(child.id, parseInt(reward.id), date)
          .then(async (returnedClaimReward) => {
            if ("ok" in returnedClaimReward) {
              toast({
                title: `Yay - well deserved, ${child.name}.`,
                status: "success",
                duration: 4000,
                isClosable: true,
              });
              // getReward({ rewardId: reward_id, revokeStateUpdate: true });
              actor?.getChildren().then(async (returnedChilren) => {
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
                set("childList", updatedChildrenData);
                await getChildren({ revokeStateUpdate: true });
                // setIsLoading(false);
                setBlockingChildUpdate(false);
              });
            } else {
              console.error(returnedClaimReward.err);
              handleUpdateTransactions(
                transactions.filter(
                  (transaction) => transaction.id !== new_transactions.id
                )
              );
              setBlockingChildUpdate(false);
            }
          })
          .finally(() => {
            // setIsLoading(false);
          });
        toast({
          title: `Approved`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        getAlerts({ callService: true });
      } catch (error) {
        toast({
          title: "An error occurred.",
          description: `Apologies, please try again later.`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
        console.log(`error block`, error);
      }
    }
  };
  const rejectRequest = async ({ task, reward }) => {
    setLoading(true);
    if (task) {
      try {
        await actor.removeTaskReq(child.id, task.id);
        getAlerts({ callService: true });
      } catch (error) {
        toast({
          title: "An error occurred.",
          description: `Apologies, please try again later.`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
        console.log(`error block`, error);
      }
    } else if (reward) {
      try {
        await actor.removeRewardReq(child.id, reward.strId);
        getAlerts({ callService: true });
      } catch (error) {
        toast({
          title: "An error occurred.",
          description: `Apologies, please try again later.`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
        console.log(`error block`, error);
      }
    }
  };

  const trailingActions = React.useCallback(
    ({ task, reward }) => (
      <TrailingActions>
        <SwipeAction
          onClick={() => approveRequest({ task, reward })}
          className="approve"
        >
          <div className="action-btn ">
            <div className="ItemColumnCentered">
              <ApproveIcon width="22px" height="22px" />
              <Text fontSize={"xs"} color={"#fff"}>
                Approve
              </Text>
            </div>
          </div>
        </SwipeAction>
        <SwipeAction
          className="delete"
          onClick={() => rejectRequest({ task, reward })}
        >
          <div className="action-btn ">
            <div className="ItemColumnCentered">
              <DeleteIcon width="22px" height="22px" />
              <Text fontSize={"xs"} color={"#fff"}>
                Remove
              </Text>
            </div>
          </div>
        </SwipeAction>
      </TrailingActions>
    ),
    []
  );

  const onSwipeStart = () => {};

  const AlertsList = React.useMemo(() => {
    return (
      <>
        {(list.tasks?.length || list.rewards?.length) ? (
          <div className="example">
            <ul className="child-list" style={{ position: "relative" }}>
              <SwipeableList
                threshold={0.25}
                type={ListType.IOS}
                fullSwipe={false}
              >
                {list.rewards.map((reward, idx) => (
                  <SwipeableListItem
                    leadingActions={null}
                    trailingActions={trailingActions({ reward: { ...reward, value: parseInt(reward.value), id: parseInt(reward.reward || reward.id), strId: reward.id }, })}
                    key={idx}
                    onSwipeStart={onSwipeStart}
                  >
                    <RequestAlert key={reward.id} req={reward} />
                  </SwipeableListItem>
                ))}
                {list.tasks.map((task, idx) => (
                  <SwipeableListItem
                    leadingActions={null}
                    trailingActions={trailingActions({
                      task: { ...task, value: parseInt(task.value) },
                    })}
                    key={idx}
                    onSwipeStart={onSwipeStart}
                  >
                    <RequestAlert key={task.id} req={task} />
                  </SwipeableListItem>
                ))}
              </SwipeableList>
            </ul>
          </div>
        ) : null}
      </>
    );
  }, [list.tasks, list.rewards]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!child) {
    return (
      <div className={`light-panel`}>
        <div
          className={`panel-header-wrapper`}
          style={{ position: "relative" }}
        >
          <h2 className="title-button dark">
            <span>Please select a child to see the alerts.</span>{" "}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`light-panel`}>
      <div className={`panel-header-wrapper`} style={{ position: "relative" }}>
        <h2 className="title-button dark alerts-title">
          <span>Reqests</span>{" "}
        </h2>
      </div>

      <>{AlertsList}</>
    </div>
  );
};

export default Alerts;
