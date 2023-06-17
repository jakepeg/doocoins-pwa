import React from "react";
import { swipeContainerStyles } from "../ChildItem";
import { ReactComponent as EditIcon } from "../../assets/images/pencil.svg";
import { ReactComponent as DeleteIcon } from "../../assets/images/delete.svg";
import SwipeToRevealActions from "react-swipe-to-reveal-actions";
import dc from "../../assets/images/dc.svg";
import styles from "./styles/tasks.module.css";
import { ReactComponent as ApproveIcon } from "../../assets/images/tick.svg";
import { Text } from "@chakra-ui/react";
import { useAuth } from "../../use-auth-client";

const ChildTask = ({
  child,
  task,
  handleUpdateOpenItemId,
  handleTogglePopup,
}) => {
  const { actor } = useAuth();
  const [taskComplete, setTaskComplete] = React.useState(null);

  function handleTaskComplete(task_id) {
    let r = window.confirm("Is the task complete?");
    if (r == true) {
      let dateNum = Math.floor(Date.now() / 1000);
      let date = dateNum.toString();
      // API call approveTask
      actor
        ?.approveTask(child.id, task_id, date)
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

  function handleUpdate(id) {
    handleTogglePopup(true, child, "edit");
  }

  function handleDelete(id) {
    handleTogglePopup(true, child, "delete");
  }

  const toggleBalance = (isOpen) => {
    handleUpdateOpenItemId(isOpen ? task.id : null);
  };

  const getActions = (id) => [
    {
      content: (
        <div style={{ height: 'auto', padding: '4px 0' }} className="action-btn approve">
          <ApproveIcon width="22px" height="22px" />
          <Text fontSize={"xs"} color={"#fff"}>
            Approve
          </Text>
        </div>
      ),
      onClick: () => handleTaskComplete(task.id),
    },
    {
      content: (
        <div style={{ height: 'auto', padding: '4px 0' }} className="action-btn edit">
          <EditIcon width="22px" height="22px" />
          <Text fontSize={"xs"}>Edit</Text>
        </div>
      ),
      onClick: () => handleUpdate(id),
    },
    {
      content: (
        <div style={{ height: 'auto', padding: '4px 0' }} className="action-btn delete">
          <DeleteIcon width="22px" height="22px" />
          <Text fontSize={"xs"}>Delete</Text>
        </div>
      ),
      onClick: () => handleDelete(id),
    },
  ];

  return (
    <li className="child-list-item">
      <div
        className="list-item"
        role="link"
        key={parseInt(task.id)}
        onKeyDown={() => handleTaskComplete(parseInt(task.id))}
      >
        <Text textAlign={'left'} fontSize={'xl'}>{task.name}</Text>
      </div>
      <SwipeToRevealActions
        actionButtons={getActions(child.id)}
        actionButtonMinWidth={120}
        containerStyle={swipeContainerStyles}
        hideDotsButton={true}
        onOpen={() => toggleBalance(true)}
        onClose={() => toggleBalance(false)}
        close={true}
      >
        <div className={styles.task_wrapper}>
          <img src={dc} className="dc-img-small" alt="DooCoins symbol" />
          {parseInt(task.value)}
        </div>
      </SwipeToRevealActions>
    </li>
  );
};

export default ChildTask;
