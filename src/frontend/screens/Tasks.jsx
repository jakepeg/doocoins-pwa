import * as React from "react";
import { get } from "idb-keyval";
import Balance from "../components/Balance";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../use-auth-client";
import ChildTask from "../components/Tasks/ChildTask";
import EditDialog from "../components/Dialogs/EditDialog";
import modelStyles from "../components/popup/confirmation_popup.module.css";
import DeleteDialog from "../components/Dialogs/DeleteDialog";
import AddTaskDialog from "../components/Tasks/AddTaskDialog";

const Tasks = () => {
  const { actor } = useAuth();
  const [tasks, setTasks] = React.useState({});
  const [newTask, setNewTask] = React.useState(null);
  const [taskComplete, setTaskComplete] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [child, setChild] = React.useState(null);
  const [openItemId, setOpenItemId] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    add_task: false,
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

  const handleTogglePopup = (isOpen, child, popup) => {
    setShowPopup((prevState) => ({ ...prevState, [popup]: isOpen }));
  };

  const handleCloseDeletePopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["delete"]: false }));
  };

  const handleCloseEditPopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["edit"]: false }));
  };

  const handleToggleAddTaskPopup = () => {
    setShowPopup((prevState) => ({
      ...prevState,
      ["add_task"]: !prevState.add_task,
    }));
  };

  const handleSubmitTask = (task) => {
    if (task) {
      handleToggleAddTaskPopup();
      actor.addTask({ value: 0, name: task }, child.id).then((response) => {
        console.log(`response added`, response);
        getTasks();
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Balance
        isModalOpen={
          showPopup.delete || showPopup.edit || showPopup.add_task
            ? modelStyles.blur_background
            : undefined
        }
        childName={child.name}
        childBalance={child.balance}
      />
      {showPopup.delete && (
        <DeleteDialog
          selectedChild={child}
          handleCloseDeletePopup={handleCloseDeletePopup}
        />
      )}
      {showPopup.edit && (
        <EditDialog
          handleCloseEditPopup={handleCloseEditPopup}
          selectedChild={child}
        />
      )}
      {showPopup.add_task && (
        <AddTaskDialog
          handleSubmitTask={handleSubmitTask}
          selectedChild={child}
          handleClosePopup={handleToggleAddTaskPopup}
        />
      )}
      <div
        className={`${
          showPopup.delete || showPopup.edit || showPopup.add_task
            ? modelStyles.blur_background
            : undefined
        }  light-panel`}
      >
        <h2 className="title-button dark">
          <span>Tasks</span>{" "}
          <span
            role="button"
            onClick={handleToggleAddTaskPopup}
            className="plus-sign"
          />
        </h2>
        {tasks.length > 0 &&
          tasks[0].map((task) => (
            <ChildTask
              key={task.id}
              task={task}
              openItemId={openItemId}
              handleUpdateOpenItemId={setOpenItemId}
              child={child}
              handleTogglePopup={handleTogglePopup}
            />
          ))}
      </div>
    </>
  );
};

export default Tasks;
