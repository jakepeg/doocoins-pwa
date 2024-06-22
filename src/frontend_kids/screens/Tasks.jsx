import * as React from "react";
import { get, set } from "idb-keyval";
import { useAuth } from "../use-auth-client";
import ChildTask from "../components/Tasks/ChildTask";
import { Skeleton, Stack, useDisclosure, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ChildContext } from "../contexts/ChildContext";
import LoadingSpinner from "../components/LoadingSpinner";
import strings from "../utils/constants";

const Tasks = () => {
  const { actor, store } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { onOpen } = useDisclosure();
  const {
    child,
    setChild,
    isNewToSystem,
    blockingChildUpdate,
    setTasks,
    tasks,
  } = React.useContext(ChildContext);
  const [loader, setLoader] = React.useState({
    init: true,
    singles: false,
    child: !child ? true : false,
  });

  React.useEffect(() => {
    if (!blockingChildUpdate) {
      getChildren({ revokeStateUpdate: false });
    }
  }, []);

  React.useEffect(() => {
    if (isNewToSystem[strings.CALLOUTS_TASKS]) {
      onOpen();
    }
  }, [isNewToSystem[strings.CALLOUTS_TASKS]]);

  React.useEffect(() => {
    if (child) {
      setLoader((prevState) => ({
        ...prevState,
        child: false,
      }));
    }
  }, [child]);

  const getChildren = async ({ revokeStateUpdate = false }) => {
    await get("selectedChild", store).then(async (data) => {
      const [balance, name] = await Promise.all([
        get(`balance-${data}`, store),
        get(`selectedChildName`, store),
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

  function getTasks({
    disableFullLoader = false,
    callService = false,
    revokeStateUpdate = false,
  }) {
    if (child) {
      if (!disableFullLoader) {
        setLoader((prevState) => ({ ...prevState, init: true }));
      }

      get("taskList", store).then(async (val) => {
        console.log(`called`, val);
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
                set("taskList", filteredTasks, store);
                if (!revokeStateUpdate) {
                  setTasks(filteredTasks || []);
                }
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
          if (!revokeStateUpdate) {
            setTasks(
              val?.map((task) => {
                return {
                  ...task,
                  id: parseInt(task.id),
                  value: parseInt(task.value),
                };
              }) || []
            );
          }
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
    if (child) getTasks({ callService: false });
  }, [actor, child]);

  const handleReq = async (selectedTask) => {
    try {
      await actor.requestTaskComplete(
        child.id,
        selectedTask.id,
        selectedTask.name,
        selectedTask.value
      );
      toast({
        title: `well done ${child.name}, the task is pending`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.log(`the error`, error);
      toast({
        title: "An error occurred.",
        description: `Apologies, please try again later.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const TaskList = React.useMemo(() => {
    return (
      <>
        {tasks?.length ? (
          <div className="example">
            <ul className="child-list" style={{ position: "relative" }}>
              {tasks.map((task) => (
                <React.Fragment key={task.id}>
                  <ChildTask handleReq={handleReq} key={task.id} task={task} />
                </React.Fragment>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  }, [tasks]);

  if (loader.child) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`light-panel max-w-screen`}>
      <div className={`panel-header-wrapper`} style={{ position: "relative" }}>
        <h2 className="title-button dark">
          <span>Tasks</span>
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
  );
};

export default Tasks;
