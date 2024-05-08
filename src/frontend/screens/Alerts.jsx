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
      getAlerts({ callService: true  });
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
              console.log(`returnedTasksReq`, returnedTasksReq);
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
                tasks: val?.map((reward) => {
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
          removeErrorItem();
        });

      get("rewardsReq")
        .then(async (val) => {
          if (val === undefined || callService) {
            actor?.getRewardReqs(child.id).then(async (returnedRewardsReq) => {
              if ("ok" in returnedRewardsReq) {
                const rewardsReq = Object.values(returnedRewardsReq);
                set("rewardsReq", rewardsReq);

                setLoading(false);
              } else {
                setLoading(false);
              }
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
      console.log(`finalTasks`, finalTasks);
      set("tasksReq", finalTasks);
      //   setRewards(finalTasks);
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
      const finalTasks = list.tasks.filter((reward) => !reward?.isLocal);
      console.log(`finalTasks`, finalTasks);
      set("tasksReq", finalTasks);
      //   setRewards(finalTasks);
    } else {
      del("tasksReq", undefined);
      setList((prevState) => ({ ...prevState, tasks: [] }));
    }
  };

  const approveTaskReq = async (task) => {
    console.log(`task`, task);
    setLoading(true)
    try {
      await actor.approveTask(task.childId, task.taskId, Date.now())
      console.log(`try block`);
      toast({
        title: `Approved`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      getAlerts({ callService: true })
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: `Apologies, please try again later.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      setLoading(false)
      console.log(`error block`, error);
    }
  }
  const rejectTaskReq = async (task) => {
    console.log(`task`, task);
    setLoading(true)
    try {
      await actor.removeTaskReq(task.childId, task.id)
      console.log(`try block`);
      getAlerts({ callService: true })
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: `Apologies, please try again later.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      setLoading(false)
      console.log(`error block`, error);
    }
  }

  const trailingActions = React.useCallback(
    ({ task }) => (
      <TrailingActions>
        <SwipeAction
          onClick={() => approveTaskReq(task)}
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
          onClick={() => rejectTaskReq(task)}
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
  console.log(`list.tasks`, list.tasks);
  
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
  }, [list.tasks]);

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
