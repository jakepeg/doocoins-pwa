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

const Alerts = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState({ tasks: [], rewards: [] });
  const [startSwiping, setStartSwiping] = React.useState(false);
  const toast = useToast();
  const { child } = React.useContext(ChildContext);
  const { actor } = useAuth();

  React.useEffect(() => {
    if (!child) {
      setLoading(false);
    }
  }, [child]);

  React.useEffect(() => {
    if (child) {
      getAlerts({ callService: true });
    }
  }, [actor, child]);

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

  const approveRequest = async ({ task, reward }) => {
    setLoading(true);
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();

    if (task) {
      try {
        await actor.approveTask(task.childId, parseInt(task.taskId), date);
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
      try {
        await actor.claimGoal(child.id, parseInt(reward.id), date);
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
        await actor.removeRewardReq(child.id, reward.id);
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

  const onSwipeStart = () => {
    setStartSwiping(true);
  };

  const AlertsList = React.useMemo(() => {
    return (
      <>
        {list.tasks?.length ? (
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
                    trailingActions={trailingActions({ reward })}
                    key={idx}
                    onSwipeStart={onSwipeStart}
                  >
                    <RequestAlert key={reward.id} req={reward} />
                  </SwipeableListItem>
                ))}
                {list.tasks.map((task, idx) => (
                  <SwipeableListItem
                    leadingActions={null}
                    trailingActions={trailingActions({ task })}
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
