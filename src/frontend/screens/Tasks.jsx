import * as React from "react";
import { get } from "idb-keyval";
import Balance from "../components/Balance";
import LoadingSpinner from "../components/LoadingSpinner";
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
import { Text } from "@chakra-ui/react";
import ApproveDialog from "../components/Dialogs/ApproveDialog";

const Tasks = () => {
  const { actor } = useAuth();
  const [tasks, setTasks] = React.useState({});
  const [taskComplete, setTaskComplete] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [child, setChild] = React.useState(null);
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    add_task: false,
    approve: false,
  });

  React.useEffect(() => {
    setIsLoading(true);
    get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([
        get(`balance-${data}`),
        get(`selectedChildName`),
      ]);
      setChild({
        id: data,
        balance: parseInt(balance),
        name,
      });
    });
  }, []);

  function getTasks() {
    if (child) {
      setIsLoading(true);
      actor
        ?.getTasks(child.id)
        .then((returnedTasks) => {
          if ("ok" in returnedTasks) {
            const tasks = Object.values(returnedTasks);
            setTasks(tasks);
            setIsLoading(false);
          } else {
            console.error(returnedTasks.err);
          }
        })
        .finally(() => setIsLoading(false));
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
      actor.addTask(task, child.id).then((response) => {
        console.log(`response added`, response);
        getTasks();
      });
    }
  };

  function updateTask(childID, taskID, taskName, taskValue) {
    console.log("updateTask called");
    const task_object = { name: taskName, value: taskValue, id: taskID, archived: false };
    actor?.updateTask(childID, taskID, task_object).then((response) => {
      console.log(`task updated`, response);
    });
  }

  function deleteTask(childID, taskID, taskName, taskValue) {
    console.log("deleteTask called");
    const task_object = { name: taskName, value: taskValue, id: taskID, archived: true };
    actor?.updateTask(childID, taskID, task_object).then((response) => {
      console.log(`task archived`, response);
    });
  }

  function handleTaskComplete(task_id) {
    // let r = window.confirm("Is the task complete?");
    // if (r == true) {
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();
    // API call approveTask
    handleCloseTogglePopup();
    actor?.approveTask(child.id, task_id, date).then((returnedApproveTask) => {
      if ("ok" in returnedApproveTask) {
        setTaskComplete(parseInt(task_id));
      } else {
        console.error(returnedApproveTask.err);
      }
    });
    // } else {
    //   console.log("You pressed cancel!");
    // }
  }

  const trailingActions = ({ task }) => (
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
  );

  const isModalOpen =
    showPopup.delete ||
    showPopup.edit ||
    showPopup.add_task ||
    showPopup.approve;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Balance
        isModalOpen={isModalOpen ? modelStyles.blur_background : undefined}
        childName={child.name}
        childBalance={child.balance}
      />
      {showPopup.delete && (
        <DeleteDialog
          selectedChild={selectedTask}
          handleCloseDeletePopup={handleCloseDeletePopup}
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
          selectedChild={selectedTask}
        />
      )}
      {showPopup.add_task && (
        <AddActionDialog
          handleSubmitTask={handleSubmitTask}
          handleClosePopup={handleToggleAddTaskPopup}
          title="Add Task"
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
        {tasks?.length && (
          <>
            <SwipeableList
              threshold={0.25}
              type={ListType.IOS}
              fullSwipe={false}
            >
              {tasks[0].map((task) => (
                <SwipeableListItem
                  leadingActions={null}
                  trailingActions={trailingActions({ task })}
                  key={task.id}
                >
                  <ChildTask key={task.id} task={task} />
                </SwipeableListItem>
              ))}
            </SwipeableList>
          </>
        )}
      </div>
    </>
  );
};

export default Tasks;
