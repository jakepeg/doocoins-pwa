import React from "react";
import { useAuth } from "../use-auth-client";
import { set, get, del } from "idb-keyval";
import ChildItem from "../components/ChildItem";
import modelStyles from "../components/popup/confirmation_popup.module.css";
import AddChildDialog from "../components/ChildList/AddChildDialog";
import DeleteDialog from "../components/Dialogs/DeleteDialog";
import EditDialog from "../components/Dialogs/EditDialog";
import {
  SwipeableList,
  Type as ListType,
  SwipeAction,
  TrailingActions,
  SwipeableListItem,
} from "react-swipeable-list";
import { ReactComponent as EditIcon } from "../assets/images/pencil.svg";
import { ReactComponent as DeleteIcon } from "../assets/images/delete.svg";
import { ReactComponent as InviteIcon } from "../assets/images/invite.svg";
import { Skeleton, Stack, Text, useDisclosure } from "@chakra-ui/react";
import AddItemToListCallout from "../components/Callouts/AddItemToListCallout";
import { ChildContext } from "../contexts/ChildContext";
import strings from "../utils/constants";
import { useNavigate } from "react-router-dom";

function ChildList() {
  const { actor } = useAuth();
  const navigate = useNavigate()
  const {
    isNewToSystem: { childList },
    handleUpdateCalloutState,
    setGoal,
    setChild
  } = React.useContext(ChildContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [children, setChildren] = React.useState(null);
  const [openItemId, setOpenItemId] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    add_child: false,
  });
  const [selectedChild, setSelectedChild] = React.useState(null);
  const [loader, setLoader] = React.useState({ init: true, singles: false });

  React.useEffect(() => {
    if (childList) {
      onOpen();
    }
  }, [childList]);

  React.useEffect(() => {
    getChildren({ callService: false });
  }, [actor]);

  function getChildren({ callService = false }) {
    del("selectedChild");
    del("selectedChildName");
    del("childGoal");
    del("rewardList");
    del("taskList");
    del("transactionList");
    setGoal(null);
    setChild(null);
    setLoader((prevState) => ({ ...prevState, init: true }));
    get("childList").then(async (val) => {
      if (val === undefined || callService) {
        setLoader((prevState) => ({ ...prevState, init: true }));
        actor
          ?.getChildren()
          .then(async (returnedChilren) => {
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
          })
          .finally(() =>
            setLoader((prevState) => ({ ...prevState, init: false }))
          );
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
        setLoader((prevState) => ({ ...prevState, init: false }));
      }
    });
  }

  function updateChild(childID, childName) {
    handleCloseEditPopup();
    const child_object = { id: childID, name: childName, archived: false };
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor?.updateChild(childID, child_object).then((response) => {
      getChildren({ callService: true });
    });
  }

  function deleteChild(childID, childName) {
    handleCloseDeletePopup();
    const child_object = { id: childID, name: childName, archived: true };
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor?.updateChild(childID, child_object).then((response) => {
      getChildren({ callService: true });
    });
  }

  async function getBalance(childID) {
    return new Promise((resolve, reject) => {
      let bal;
      get("balance-" + childID)
        .then((val) => {
          // if (val === undefined) {
          actor?.getBalance(childID).then((returnedBalance) => {
            set("balance-" + childID, parseInt(returnedBalance));
            resolve(returnedBalance);
          });
          // } else {
          //   bal = val;
          //   resolve(bal);
          // }
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
    } finally {
      setLoader((prevState) => ({ ...prevState, singles: false }));
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
    onClose();
    handleUpdateCalloutState([strings.CALLOUTS_CHILD_LIST], false);
  };

  const handleSubmit = async (childName) => {
    if (childName) {
      handleToggleAddChildPopup();
      const child_object = { name: childName };
      let me = await actor.whoami();
      setLoader((prevState) => ({ ...prevState, singles: true }));
      actor?.addChild(child_object).then((returnedAddChild) => {
        if ("ok" in returnedAddChild) {
          updateChildList(returnedAddChild);
        } else {
          console.error(returnedAddChild.err);
        }
      });
    }
  };

  const trailingActions = React.useCallback(
    ({ child }) => (
      <TrailingActions>
        <SwipeAction
          className="invite"
          onClick={() => navigate("/invite", { state: { child } })}
        >
          <div className="action-btn ">
            <div className="ItemColumnCentered">
              <InviteIcon width="22px" height="22px" />
              <Text fontSize={"xs"} color={"#fff"}>
                Invite
              </Text>
            </div>
          </div>
        </SwipeAction>


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
    ),
    []
  );

  const ChildrenList = React.useMemo(() => {
    return (
      <>
        {children?.length ? (
          <div className="example">
            <ul className="list-wrapper">
              <SwipeableList
                threshold={0.25}
                type={ListType.IOS}
                fullSwipe={false}
              >
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
        ) : null}
      </>
    );
  }, [children]);

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
          selectedItem={selectedChild}
          handleDelete={deleteChild}
        />
      )}
      {showPopup.edit && (
        <EditDialog
          handleCloseEditPopup={handleCloseEditPopup}
          selectedItem={selectedChild}
          handleSubmitForm={updateChild}
          hasValueField={false}
          namePlaceholder="Child Name"
        />
      )}
      <div
        className={`${
          showPopup.delete || showPopup.edit || showPopup.add_child
            ? modelStyles.blur_background
            : undefined
        }`}
        style={{ background: '#0B334D' }}
      >
        <div className={`child-list-wrapper`} style={{ position: "relative" }}>
          <h2 className="title-button light">
            <span>My Children</span>
            <span
              className="plus-sign"
              role="button"
              onClick={handleToggleAddChildPopup}
            />
          </h2>
          {isOpen && (
            <AddItemToListCallout
              TextDescription={
                <>
                  How do you doo?! <br /> Tap the + icon to add a child
                </>
              }
              itemKey={strings.CALLOUTS_CHILD_LIST}
              isOpen={isOpen && !loader.init && !children?.length}
              onClose={onClose}
            />
          )}
        </div>
        {loader.init ? (
          <Stack margin={"0 20px 20px 20px"}>
            <Skeleton height="20px" />
            <Skeleton height="20px" mt={"12px"} />
            <Skeleton height="20px" mt={"12px"} />
          </Stack>
        ) : (
          <>{ChildrenList}</>
        )}
        {loader.singles && (
          <Stack margin={"0 20px 20px 20px"}>
            <Skeleton height="20px" mt={"12px"} />
          </Stack>
        )}
      </div>
    </>
  );
}

export default ChildList;