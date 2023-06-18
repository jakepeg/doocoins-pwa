import React from "react";
import { useAuth } from "../use-auth-client";
import { set, get, del } from "idb-keyval";
import ChildItem from "../components/ChildItem";
import modelStyles from "../components/popup/confirmation_popup.module.css";
import ConfirmationPopup from "../components/popup/ConfirmationPopup";
import AddChildDialog from "../components/ChildList/AddChildDialog";
import DeleteDialog from "../components/Dialogs/DeleteDialog";
import EditDialog from "../components/Dialogs/EditDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  SwipeableList,
  Type as ListType,
  LeadingActions,
  SwipeAction,
  TrailingActions,
  SwipeableListItem,
} from "react-swipeable-list";
import { ReactComponent as EditIcon } from "../assets/images/pencil.svg";
import { ReactComponent as DeleteIcon } from "../assets/images/delete.svg";
import { Text } from "@chakra-ui/react";

function ChildList() {
  const { actor, logout } = useAuth();
  const [children, setChildren] = React.useState(null);
  const [openItemId, setOpenItemId] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    add_child: false,
  });
  const [selectedChild, setSelectedChild] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    getChildren();
  }, [actor]);

  function getChildren() {
    del("selectedChild");
    del("selectedChildName");
    setIsLoading(true);
    get("childList")
      .then(async (val) => {
        if (val === undefined) {
          actor?.getChildren().then(async (returnedChilren) => {
            if ("ok" in returnedChilren) {
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
              setChildren(updatedChildrenData);
              set("childList", updatedChildrenData);
            } else {
              console.error(returnedChilren.err);
            }
          });
        } else {
          const updatedChildrenData = await Promise.all(
            Object.values(val).map(async (child) => {
              const balance = await getBalance(child.id);
              return {
                ...child,
                balance: parseInt(balance),
              };
            })
          );
          setChildren(updatedChildrenData);
        }
      })
      .finally(() => setIsLoading(false));
  }

  async function getBalance(childID) {
    return new Promise((resolve, reject) => {
      let bal;
      get("balance-" + childID)
        .then((val) => {
          if (val === undefined) {
            actor?.getBalance(childID).then((returnedBalance) => {
              set("balance-" + childID, parseInt(returnedBalance));
              resolve(returnedBalance);
            });
          } else {
            bal = val;
            resolve(bal);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // update the childList after adding a new child
  async function updateChildList(returnedAddChild) {
    try {
      const childList = await get("childList");
      const updatedChildList = { ...childList, ...returnedAddChild };

      const updatedChildrenData = await Promise.all(
        Object.values(updatedChildList).map(async (child) => {
          const balance = await getBalance(child.id);
          return {
            ...child,
            balance: parseInt(balance),
          };
        })
      );

      await set("childList", updatedChildrenData);
      setChildren(updatedChildrenData);
    } catch (error) {
      console.error("Error adding item to childList:", error);
    }
  }

  const handleTogglePopup = (isOpen, child, popup) => {
    setSelectedChild(child);
    setShowPopup((prevState) => ({ ...prevState, [popup]: isOpen }));
  };

  const handleCloseDeletePopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["delete"]: false }));
  };

  const handleCloseEditPopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["edit"]: false }));
  };

  const handleToggleAddChildPopup = () => {
    setShowPopup((prevState) => ({
      ...prevState,
      ["add_child"]: !prevState.add_child,
    }));
  };

  const handleSubmit = async (childName) => {
    if (childName) {
      handleToggleAddChildPopup();
      const child_object = { name: childName };
      let me = await actor.whoami();
      setIsLoading(true);
      actor
        ?.addChild(child_object)
        .then((returnedAddChild) => {
          if ("ok" in returnedAddChild) {
            updateChildList(returnedAddChild);
          } else {
            console.error(returnedAddChild.err);
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const trailingActions = ({ child }) => (
    <TrailingActions>
      <SwipeAction
        className="edit"
        onClick={() => handleTogglePopup(true, child, "edit")}
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
        onClick={() => handleTogglePopup(true, child, "delete")}
      >
        <div className="action-btn">
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

  return (
    <>
      {showPopup.add_child && (
        <AddChildDialog
          handleClosePopup={handleToggleAddChildPopup}
          handleSubmit={handleSubmit}
        />
      )}
      {showPopup.delete && (
        <DeleteDialog
          handleCloseDeletePopup={handleCloseDeletePopup}
          selectedChild={selectedChild}
        />
      )}
      {showPopup.edit && (
        <EditDialog
          handleCloseEditPopup={handleCloseEditPopup}
          selectedChild={selectedChild}
        />
      )}
      <div
        className={`${
          showPopup.delete || showPopup.edit || showPopup.add_child
            ? modelStyles.blur_background
            : undefined
        }`}
      >
        <div className={`child-list-wrapper`}>
          <h2 className="title-button light">
            <span>My Children</span>
            <span
              className="plus-sign"
              role="button"
              onClick={handleToggleAddChildPopup}
            />
          </h2>
        </div>
        {children ? (
          <div className="example">
            <ul className="child-list">
              <SwipeableList threshold={0.25} type={ListType.IOS} fullSwipe={false}>
                {children.length > 0 &&
                  children.map((child, index) => {
                    return (
                      <SwipeableListItem
                        leadingActions={null}
                        trailingActions={trailingActions({ child })}
                        key={child.id}
                      >
                        <ChildItem
                          child={child}
                          handleUpdateOpenItemId={setOpenItemId}
                          openItemId={openItemId}
                          index={index}
                          handleTogglePopup={handleTogglePopup}
                        />
                      </SwipeableListItem>
                    );
                  })}
              </SwipeableList>
            </ul>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
}

export default ChildList;
