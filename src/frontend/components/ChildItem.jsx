import React from "react";
import SwipeToRevealActions from "react-swipe-to-reveal-actions";
import EditIcon from "../assets/images/pencil.svg";
import DeleteIcon from "../assets/images/delete.svg";
import { Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { set } from "idb-keyval";
import { ReactComponent as DCIcon } from "../assets/images/dc-white.svg";

const ChildItem = ({
  child,
  handleUpdateOpenItemId,
  openItemId,
  index,
  handleTogglePopup,
}) => {
  const [showBalance, setShowBalance] = React.useState(true);
  const isItemOpen = openItemId === child.id;

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // :r0: format from library
      const actionsElement = document.getElementById(`:r${index}:`);
      if (!isItemOpen && actionsElement) {
        setShowBalance(true);
      }
    }
  }, [isItemOpen]);

  function handleDelete(id) {
    handleTogglePopup(true, child, "delete");
    setShowBalance(true);
  }

  function handleUpdate(id) {
    handleTogglePopup(true, child, "edit");
    setShowBalance(true);
  }

  const getActions = (id) => [
    {
      content: (
        <div className="action-btn edit">
          <img src={EditIcon} alt="edit" />
        </div>
      ),
      onClick: () => handleUpdate(id),
    },
    {
      content: (
        <div className="action-btn delete">
          <img src={DeleteIcon} alt="delete" />
        </div>
      ),
      onClick: () => handleDelete(id),
    },
  ];

  const toggleBalance = (isOpen) => {
    setShowBalance(!isOpen);
    handleUpdateOpenItemId(isOpen ? child.id : null);
  };

  const swipeContainerStyles = {
    backgroundColor: "#FFF",
    paddingLeft: "1rem",
  };

  const handleSelectChild = () => {
    set("selectedChild", child.id);
    set("selectedChildName", child.name);
  };

  return (
    <li className="child-list-item">
      <Link to="/wallet">
        <Box
          onClick={handleSelectChild}
          display="flex"
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box textAlign={"left"}>{child.name}</Box>
          {showBalance && (
            <div className="child-balance">
              <DCIcon className="balance-dc-icon" width="28px" height="28px" />
              <p> {child.balance}</p>
            </div>
          )}
        </Box>
      </Link>
      <SwipeToRevealActions
        actionButtons={getActions(child.id)}
        actionButtonMinWidth={120}
        containerStyle={swipeContainerStyles}
        hideDotsButton={true}
        onOpen={() => toggleBalance(true)}
        onClose={() => toggleBalance(false)}
      />
    </li>
  );
};

export default ChildItem;
