import * as React from "react";
import { get } from "idb-keyval";
import Balance from "../components/Balance";
import LoadingSpinner from "../components/LoadingSpinner";
import dc from "../assets/images/dc.svg";

const Tasks = () => {
  const [actor, setActor] = React.useState(null);
  const [tasks, setTasks] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [child, setChild] = React.useState(null);

  React.useEffect(() => {
    setIsLoading(true)
    get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([get(`balance-${data}`), get(`selectedChildName`)])
      setChild({
        id: data,
        balance: parseInt(balance),
        name
      });
    })
  }, [])

  function getTasks() {
    if (child) {
      console.log("getTasks called for child id: " + child);
      setIsLoading(true);
      actor?.getTasks(child.id).then((returnedTasks) => {
        if ("ok" in returnedTasks) {
          const tasks = Object.values(returnedTasks);
          setTasks(tasks);
          setIsLoading(false);
        } else {
          console.error(returnedTasks.err);
        }
      }).finally(() => setIsLoading(false));;
      return false;
    }
  }

  // add swiper - delete, edit, approve tasks
  function handleTaskComplete(task_id) {
    let r = window.confirm("Is the task complete?");
    if (r == true) {
      let dateNum = Math.floor(Date.now() / 1000);
      let date = dateNum.toString();
      // API call approveTask
      actor
        ?.approveTask(selectedChild, task_id, date)
        .then((returnedApproveTask) => {
          if ("ok" in returnedApproveTask) {
            setTaskComplete(parseInt(task_id));
          } else {
            console.error(returnedApproveTask.err);
          }
        });
    } else {
      console.log("You pressed cancel!");
    }
  }

  const initActor = () => {
    import("../../declarations/backend").then((module) => {
      const actor = module.createActor(module.canisterId, {});
      setActor(actor);
    });
  };

  React.useEffect(() => {
    initActor();
  }, []);

  React.useEffect(() => {
    if (child) getTasks(child);
  }, [actor, child]);

  if(isLoading) {
    return  <LoadingSpinner />
  }

  return (
    <>
      <Balance childName={child.name} childBalance={child.balance} />

      <div className="light-panel">
        <h2 className="title-button dark"><span>Tasks</span> <span className="plus-sign"></span></h2>
        {isLoading ? <LoadingSpinner /> : null}
        {tasks.length > 0 &&
          tasks[0].map((task) => (
            <div
              className="list-item"
              role="button"
              key={parseInt(task.id)}
              onClick={() => handleTaskComplete(parseInt(task.id))}
              onKeyDown={() => handleTaskComplete(parseInt(task.id))}
            >
              <div>{task.name}</div>
              <div>
                <img src={dc} className="dc-img-small" alt="DooCoins symbol" />
                {parseInt(task.value)}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Tasks;
