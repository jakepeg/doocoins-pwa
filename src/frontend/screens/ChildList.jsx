import React from "react";
import { useAuth } from "../use-auth-client";
import { set, get, del } from "idb-keyval";
import AddChild from "../components/AddChild";
import ChildItem from "../components/ChildItem";
import modelStyles from "../components/popup/confirmation_popup.module.css";
import ConfirmationPopup from "../components/popup/ConfirmationPopup";
import AddChildDialog from "../components/ChildList/AddChildDialog";

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

  React.useEffect(() => {
    getChildren();
  }, [actor]);

  function getChildren() {
    del("selectedChild");
    del("selectedChildName");
    get("childList").then(async (val) => {
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
    });
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
      actor?.addChild(child_object).then((returnedAddChild) => {
        if ("ok" in returnedAddChild) {
          updateChildList(returnedAddChild);
        } else {
          console.error(returnedAddChild.err);
        }
      });
    }
  };

  return (
    <>
      {showPopup.add_child && (
        <AddChildDialog
          handleClosePopup={handleToggleAddChildPopup}
          handleSubmit={handleSubmit}
        />
      )}
      {showPopup.delete && (
        <ConfirmationPopup handleClosePopup={handleCloseDeletePopup}>
          <h4 className={modelStyles.popup_title}>
            Delete {selectedChild.name}
          </h4>
          <button
            className={modelStyles.popup_delete_action_btn}
            onClick={handleCloseDeletePopup}
          >
            DELETE
          </button>
          <p
            className={modelStyles.popup_cancel_action_btn}
            onClick={handleCloseDeletePopup}
          >
            cancel
          </p>
        </ConfirmationPopup>
      )}
      {showPopup.edit && (
        <ConfirmationPopup handleClosePopup={handleCloseEditPopup}>
          <h4 className={modelStyles.popup_title}>Edit {selectedChild.name}</h4>
          <input
            type="text"
            name="child_name"
            style={{ marginTop: "18px" }}
            className={`text-field ${modelStyles.popup_input_edit_field}`}
            value={selectedChild.name}
          />
          <button
            className={modelStyles.popup_edit_action_btn}
            onClick={handleCloseEditPopup}
          >
            EDIT
          </button>
          <p
            className={modelStyles.popup_cancel_action_btn}
            onClick={handleCloseEditPopup}
          >
            cancel
          </p>
        </ConfirmationPopup>
      )}
      <div
        className={`${
          showPopup.delete || showPopup.edit || showPopup.add_child
            ? modelStyles.blur_background
            : undefined
        }`}
      >
        <h2 className="title-button light">
          <span>My Children</span>
          <span
            className="plus-sign"
            role="button"
            onClick={handleToggleAddChildPopup}
          />
        </h2>

        {children ? (
          <div className="example">
            <ul className="child-list">
              {children.length > 0 &&
                children.map((child, index) => {
                  const isItemOpen = openItemId === child.id;
                  if (typeof window !== "undefined") {
                    // :r0: format from library
                    const actionsElement = document.getElementById(
                      `:r${index}:`
                    );
                    if (!isItemOpen && actionsElement) {
                      actionsElement.style.display = "none";
                    } else if (isItemOpen && actionsElement) {
                      actionsElement.style.display = "block";
                    }
                  }

                  return (
                    <ChildItem
                      child={child}
                      handleUpdateOpenItemId={setOpenItemId}
                      openItemId={openItemId}
                      index={index}
                      key={child.id + index.toString()}
                      handleTogglePopup={handleTogglePopup}
                    />
                  );
                })}
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
