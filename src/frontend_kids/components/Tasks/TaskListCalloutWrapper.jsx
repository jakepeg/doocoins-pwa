import React from "react";
import SwipeListCallout from "../Callouts/SwipeListCallout";
import { useDisclosure } from "@chakra-ui/react";
import { ChildContext } from "../../contexts/ChildContext";
import strings from "../../utils/constants";

const TaskListCalloutWrapper = ({ startSwiping, tasks }) => {
  const { isNewToSystem, handleUpdateCalloutState } =
    React.useContext(ChildContext);
  const {
    isOpen: isOpenAddTask,
    onOpen: onOpenAddTask,
    onClose: onCloseAddTask,
  } = useDisclosure();

  React.useEffect(() => {
    if (isNewToSystem[strings.CALLOUT_TASKS_LIST]) {
      onOpenAddTask();
    }
  }, [isNewToSystem[strings.CALLOUT_TASKS_LIST]]);

  React.useEffect(() => {
    if (startSwiping && isOpenAddTask) {
      onCloseAddTask();
      handleUpdateCalloutState([strings.CALLOUT_TASKS_LIST], false);
    }
  }, [startSwiping, isOpenAddTask]);

  return (
    <>
      {/* {isOpenAddTask && tasks.length === 1 && (
        <SwipeListCallout
          isOpen={isOpenAddTask}
          onClose={onCloseAddTask}
          itemKey={strings.CALLOUT_TASKS_LIST}
        />
      )} */}
    </>
  );
};

export default TaskListCalloutWrapper;
