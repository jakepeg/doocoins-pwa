import * as React from "react";
import { get, set } from "idb-keyval";
import Balance from "../components/Balance";
import { useAuth } from "../use-auth-client";
import ChildTask from "../components/Tasks/ChildTask";
import EditDialog from "../components/Dialogs/EditDialog";
import modelStyles from "../components/popup/confirmation_popup.module.css";
import DeleteDialog from "../components/Dialogs/DeleteDialog";
import AddActionDialog from "../components/Tasks/AddActionDialog";
import {
  SwipeableList,
  Type as ListType,
  SwipeAction,
  TrailingActions,
  SwipeableListItem,
} from "react-swipeable-list";
import { ReactComponent as ApproveIcon } from "../assets/images/tick.svg";
import { ReactComponent as EditIcon } from "../assets/images/pencil.svg";
import { ReactComponent as DeleteIcon } from "../assets/images/delete.svg";
import { Skeleton, Stack, Text, useToast } from "@chakra-ui/react";
import ApproveDialog from "../components/Dialogs/ApproveDialog";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const { actor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = React.useState({});
  const [taskComplete, setTaskComplete] = React.useState(null);
  const [loader, setLoader] = React.useState({ init: true, singles: false });
  const [child, setChild] = React.useState(null);
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    add_task: false,
    approve: false,
  });

  React.useEffect(() => {
    setLoader((prevState) => ({ ...prevState, init: true }));
    getChildren();
  }, []);

  const getChildren = async () => {
    await get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([
        get(`balance-${data}`),
        get(`selectedChildName`),
      ]);
      if (data) {
        setChild({
          id: data,
          balance: parseInt(balance),
          name,
        });
      } else {
        navigate("/");
      }
    });
  };

  function getTasks({ disableFullLoader = false, callService = false }) {
    if (child) {
      if (!disableFullLoader) {
        setLoader((prevState) => ({ ...prevState, init: true }));
      }

      get("taskList").then(async (val) => {
        if (val === undefined || callService) {
          actor
            ?.getTasks(child.id)
            .then((returnedTasks) => {
              if ("ok" in returnedTasks) {
                const tasks = Object.values(returnedTasks);
                set("taskList", tasks);
                setTasks(tasks[0]);
              } else {
                console.error(returnedTasks.err);
              }
            })
            .finally(() =>
              setLoader((prevState) => ({
                ...prevState,
                init: false,
                singles: false,
              }))
            );
        } else {
          setTasks(
            val[0]?.map((task) => {
              return {
                ...task,
                id: parseInt(task.id),
                value: parseInt(task.value),
              };
            })
          );
          setLoader((prevState) => ({
            ...prevState,
            init: false,
            singles: false,
          }));
        }
      });

      return false;
    }
  }

  React.useEffect(() => {
    if (child) getTasks(child);
  }, [actor, child]);

  const handleTogglePopup = (isOpen, task, popup) => {
    setSelectedTask(task);
    setShowPopup((prevState) => ({ ...prevState, [popup]: isOpen }));
  };

  const handleCloseDeletePopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["delete"]: false }));
  };

  const handleCloseEditPopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["edit"]: false }));
  };

  const handleCloseTogglePopup = () => {
    setShowPopup((prevState) => ({
      ...prevState,
      ["approve"]: !prevState.approve,
    }));
  };

  const handleToggleAddTaskPopup = () => {
    setShowPopup((prevState) => ({
      ...prevState,
      ["add_task"]: !prevState.add_task,
    }));
  };

  const handleSubmitTask = (taskName, value) => {
    if (taskName) {
      const task = {
        name: taskName,
        value: parseInt(value),
      };
      handleToggleAddTaskPopup();
      setLoader((prevState) => ({ ...prevState, singles: true }));
      actor.addTask(task, child.id).then((response) => {
        getTasks({ disableFullLoader: true, callService: true });
      });
    }
  };

  function updateTask(taskID, taskName, taskValue) {
    const task_object = {
      name: taskName,
      value: taskValue,
      id: taskID,
      archived: false,
    };
    handleCloseEditPopup();
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor?.updateTask(child.id, taskID, task_object).then((response) => {
      getTasks({ disableFullLoader: false, callService: true });
    });
  }

  function deleteTask(taskID, taskName, taskValue) {
    const task_object = {
      name: taskName,
      value: taskValue,
      id: taskID,
      archived: true,
    };
    handleCloseDeletePopup();
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor
      ?.updateTask(child.id, taskID, task_object)
      .then((response) => {
        getTasks({ disableFullLoader: false, callService: true });
      })
      .finally(() => setSelectedTask(null));
  }

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

  function handleTaskComplete(task_id) {
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();
    // API call approveTask
    handleCloseTogglePopup();
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor?.approveTask(child.id, task_id, date).then((returnedApproveTask) => {
      if ("ok" in returnedApproveTask) {
        setTaskComplete(parseInt(task_id));
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
            await getChildren();
            setLoader((prevState) => ({ ...prevState, init: false }));
          } else {
            setLoader((prevState) => ({ ...prevState, init: false }));
            console.error(returnedChilren.err);
          }
        });
      } else {
        setLoader((prevState) => ({ ...prevState, init: false }));
        console.error(returnedApproveTask.err);
      }
    });
  }

  const trailingActions = React.useCallback(
    ({ task }) => (
      <TrailingActions>
        <SwipeAction
          onClick={() => handleTogglePopup(true, task, "approve")}
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
          className="edit"
          onClick={() => handleTogglePopup(true, task, "edit")}
        >
          <div className="action-btn ">
            <div className="ItemColumnCentered">
              <EditIcon width="22px" height="22px" />
              <Text fontSize={"xs"} color={"#fff"}>
                Edit
              </Text>
            </div>
          </div>
        </SwipeAction>
        <SwipeAction
          className="delete"
          onClick={() => handleTogglePopup(true, task, "delete")}
        >
          <div className="action-btn ">
            <div className="ItemColumnCentered">
              <DeleteIcon width="22px" height="22px" />
              <Text fontSize={"xs"} color={"#fff"}>
                Delete
              </Text>
            </div>
          </div>
        </SwipeAction>
      </TrailingActions>
    ),
    []
  );

  const TaskList = React.useMemo(() => {
    return (
      <>
        {tasks?.length ? (
          <div className="example">
            <ul className="child-list">
              <SwipeableList
                threshold={0.25}
                type={ListType.IOS}
                fullSwipe={false}
              >
                {tasks.map((task) => (
                  <SwipeableListItem
                    leadingActions={null}
                    trailingActions={trailingActions({ task })}
                    key={task.id}
                  >
                    <ChildTask key={task.id} task={task} />
                  </SwipeableListItem>
                ))}
              </SwipeableList>
            </ul>
          </div>
        ) : null}
      </>
    );
  }, [tasks]);

  const isModalOpen =
    showPopup.delete ||
    showPopup.edit ||
    showPopup.add_task ||
    showPopup.approve;

  return (
    <>
      <Balance
        isModalOpen={isModalOpen ? modelStyles.blur_background : undefined}
        childName={child?.name}
        childBalance={child?.balance}
      />
      {showPopup.delete && (
        <DeleteDialog
          selectedItem={selectedTask}
          handleCloseDeletePopup={handleCloseDeletePopup}
          handleDelete={() =>
            deleteTask(
              parseInt(selectedTask.id),
              selectedTask.name,
              parseInt(selectedTask.value)
            )
          }
        />
      )}
      {showPopup.approve && (
        <ApproveDialog
          handleClosePopup={handleCloseTogglePopup}
          selectedItem={selectedTask}
          handleApprove={() => handleTaskComplete(parseInt(selectedTask.id))}
        />
      )}
      {showPopup.edit && (
        <EditDialog
          handleCloseEditPopup={handleCloseEditPopup}
          selectedItem={selectedTask}
          handleSubmitForm={(taskId, taskName, taskValue) =>
            updateTask(parseInt(selectedTask.id), taskName, parseInt(taskValue))
          }
        />
      )}
      {showPopup.add_task && (
        <AddActionDialog
          handleSubmitForm={handleSubmitTask}
          handleClosePopup={handleToggleAddTaskPopup}
          title="Add a Task"
          namePlaceHolder="Task Name"
          valuePlaceHolder="Task Value"
        />
      )}
      <div
        className={`${
          isModalOpen ? modelStyles.blur_background : undefined
        } light-panel`}
      >
        <div className={`panel-header-wrapper`}>
          <h2 className="title-button dark">
            <span>Tasks</span>{" "}
            <span
              role="button"
              onClick={handleToggleAddTaskPopup}
              className="plus-sign"
            />
          </h2>
        </div>
        {loader.init ? (
          <Stack margin={"0 20px 20px 20px"}>
            <Skeleton height="20px" />
            <Skeleton height="20px" mt={"12px"} />
            <Skeleton height="20px" mt={"12px"} />
          </Stack>
        ) : (
          <>{TaskList}</>
        )}
        {loader.singles && (
          <Stack margin={"0 20px 20px 20px"}>
            <Skeleton height="20px" mt={"12px"} />
          </Stack>
        )}
      </div>
    </>
  );
};

export default Tasks;
