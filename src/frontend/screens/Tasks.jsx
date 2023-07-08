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
import { ChildContext } from "../contexts/ChildContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Tasks = () => {
  const { actor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = React.useState([]);
  const [taskComplete, setTaskComplete] = React.useState(null);
  const { child, setChild } = React.useContext(ChildContext);
  const [loader, setLoader] = React.useState({
    init: true,
    singles: false,
    child: !child ? true : false,
  });
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    add_task: false,
    approve: false,
  });
  const [transactions, setTransactions] = React.useState([]);

  React.useEffect(() => {
    getChildren();
  }, []);

  React.useEffect(() => {
    if (child) {
      setLoader((prevState) => ({
        ...prevState,
        child: false,
      }));
    }
  }, [child]);

  function getTransactions() {
    get("transactionList").then(async (val) => {
      setTransactions(val || []);
    });
  }

  React.useEffect(() => {
    getTransactions();
  }, []);

  const getChildren = async () => {
    console.log('should be here')
    await get("selectedChild").then(async (data) => {
      console.log(`data`, data)
      const [balance, name] = await Promise.all([
        get(`balance-${data}`),
        get(`selectedChildName`),
      ]);
      console.log(`balance`,balance)
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
                const filteredTasks = tasks?.[0]?.map((task) => {
                  return {
                    ...task,
                    id: parseInt(task.id),
                    value: parseInt(task.value),
                  };
                });
                set("taskList", filteredTasks);
                setTasks(filteredTasks || []);
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
            val?.map((task) => {
              return {
                ...task,
                id: parseInt(task.id),
                value: parseInt(task.value),
              };
            }) || []
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
        id: tasks?.[0]?.id + 1 || 1,
        isLocal: true,
      };
      handleToggleAddTaskPopup();
      setTasks((prevState) => {
        set("taskList", [task, ...prevState]);
        return [task, ...prevState];
      });
      // setLoader((prevState) => ({ ...prevState, singles: true }));
      actor
        .addTask(task, child.id)
        .then((response) => {
          if ("ok" in response) {
            getTasks({ disableFullLoader: true, callService: true });
          } else {
            removeErrorItem();
          }
        })
        .catch((error) => {
          console.log("error", error);
          removeErrorItem();
        });
    }
  };

  const removeErrorItem = () => {
    if (tasks?.length) {
      toast({
        title: "An error occurred.",
        description: `Apologies, please try again later.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      const finalTasks = tasks.filter((task) => !task?.isLocal);
      set("taskList", finalTasks);
      setTasks(finalTasks);
    } else {
      set("taskList", []);
      setTasks([]);
    }
  };

  function updateTask(taskID, taskName, taskValue) {
    const task_object = {
      ...selectedTask,
      name: taskName,
      value: taskValue,
      id: taskID,
      archived: false,
    };
    handleCloseEditPopup();
    let prevTask;
    // setLoader((prevState) => ({ ...prevState, init: true }));
    const updatedList = tasks.map((task) => {
      if (task.id === task_object.id) {
        prevTask = task;
        return task_object;
      } else {
        return task;
      }
    });
    setTasks(updatedList);
    set("taskList", updatedList);

    actor
      ?.updateTask(child.id, taskID, task_object)
      .then((response) => {
        if ("ok" in response) {
          getTasks({ disableFullLoader: true, callService: true });
        } else {
          const updatedList = tasks.map((task) => {
            const updatedTask = task.id === task_object.id ? prevTask : task;
            return updatedTask;
          });
          setTasks(updatedList);
          set("taskList", updatedList);
        }
      })
      .finall(() => setSelectedTask(null));
  }

  function deleteTask(taskID, taskName, taskValue) {
    const task_object = {
      ...selectedTask,
      name: taskName,
      value: taskValue,
      id: taskID,
      archived: true,
    };
    handleCloseDeletePopup();
    const finalTask = tasks.filter((task) => task.id !== taskID);
    setTasks(finalTask);
    set("taskList", finalTask);
    // setLoader((prevState) => ({ ...prevState, init: true }));
    actor
      ?.updateTask(child.id, taskID, task_object)
      .then((response) => {
        if ("ok" in response) {
          getTasks({ disableFullLoader: true, callService: true });
        } else {
          setTasks((prevState) => {
            set("taskList", [...prevState, task_object]);
            return [...prevState, task_object];
          });
          toast({
            title: "An error occurred.",
            description: `Can't perform delete, please try again later.`,
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
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
    const new_transactions = {
      completedDate: date,
      id: transactions?.[0]?.id ? parseInt(transactions?.[0]?.id) + 1 : 1,
      value: selectedTask.value,
      name: selectedTask.name,
      transactionType: "TASK_CREDIT",
    };
    setChild((prevState) => ({  ...prevState, balance: prevState.balance + selectedTask.value  }));
    set("transactionList", [new_transactions, ...transactions]);
    setTransactions([new_transactions, ...transactions]);
    // API call approveTask
    handleCloseTogglePopup();
    // setLoader((prevState) => ({ ...prevState, init: true }));
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
        const filteredTransactions = transactions.filter(
          (transaction) => transaction.id !== new_transactions.id
        );
        setTransactions(filteredTransactions);
        setChild((prevState) => ({  ...prevState, balance: prevState.balance - selectedTask.value  }));
        set("transactionList", filteredTransactions);
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

  if (loader.child) {
    return <LoadingSpinner />;
  }

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
