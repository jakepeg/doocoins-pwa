import React from "react";
import { useAuth } from "../use-auth-client";
import SwipeToRevealActions from "react-swipe-to-reveal-actions";
import { set, get, del } from "idb-keyval";
import AddChild from "../components/AddChild";
import ChildItem from "../components/ChildItem";
import modelStyles from "../components/popup/confirmation_popup.module.css";
import ConfirmationPopup from "../components/popup/ConfirmationPopup";

function ChildList() {
  const [actor, setActor] = React.useState(null);
  const [children, setChildren] = React.useState(null);
  const [newChild, setNewChild] = React.useState(null);
  const [openItemId, setOpenItemId] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false
  });
  const [selectedChild, setSelectedChild] = React.useState(null);

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
    getChildren();
  }, [actor]);

  function getChildren() {
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
                  balance: balance
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
              balance: balance
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
            console.log('the bal', bal)
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
      const childList = await get('childList');
      const updatedChildList = { ...childList, ...returnedAddChild };

      const updatedChildrenData = await Promise.all(
        Object.values(updatedChildList).map(async (child) => {
          const balance = await getBalance(child.id);
          return {
            ...child,
            balance: balance
          };
        })
      );

      await set('childList', updatedChildrenData);
      setChildren(updatedChildrenData);
    } catch (error) {
      console.error('Error adding item to childList:', error);
    }
  }

  // add a new child
  function handleAddChild(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll("input");
    const child_name = e.target.querySelector('input[name="child_name"]').value;
    const child_object = { name: child_name };
    // API call addChild
    actor?.addChild(child_object).then((returnedAddChild) => {
      if ("ok" in returnedAddChild) {
        setNewChild(child_name);
        updateChildList(returnedAddChild);
        // update children variable with setChildren
        // same with balance
        // re-run getChildren()
        inputs.forEach((input) => {
          input.value = "";
        });
      } else {
        console.error(returnedAddChild.err);
      }
    });
    return false;
  }

  const { whoamiActor, logout } = useAuth();

  function handleLogout() {
    del("childList");
    logout();
  }

  const me = async () => {
    const whoami = await whoamiActor.whoami();
  };

  const handleTogglePopup = (isOpen, child, popup) => {
    setSelectedChild(child);
    setShowPopup((prevState) => ({ ...prevState, [popup]: isOpen }));
  };

  const handleCloseDeletePopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["delete"]: false }))
  }

  const handleCloseEditPopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["edit"]: false }))
  }

  return (
    <>
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
          (showPopup.delete || showPopup.edit) ? modelStyles.blur_background : undefined
        }`}
      >
        <h2 className="screen-title light">My Children</h2>
        {/* <button onClick={me}>
        Me
      </button> */}

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
                      key={child.id}
                      handleTogglePopup={handleTogglePopup}
                    />
                  );
                })}
            </ul>
          </div>
        ) : (
          <p>Loading...</p>
        )}

        <h2 className="screen-title light">Add a child</h2>
        <AddChild
          handleAddChild={handleAddChild}
          // childID = {selectedChild}
        />
      </div>
    </>
  );
}

export default ChildList;