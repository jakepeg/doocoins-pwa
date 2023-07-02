import * as React from "react";
import { get, set } from "idb-keyval";
import Balance from "../components/Balance";
import dc from "../assets/images/dc.svg";
import { useAuth } from "../use-auth-client";
import modelStyles from "../components/popup/confirmation_popup.module.css";
import {
  SwipeableList,
  Type as ListType,
  SwipeAction,
  TrailingActions,
  SwipeableListItem,
} from "react-swipeable-list";
import { ReactComponent as ApproveIcon } from "../assets/images/tick.svg";
import { ReactComponent as GoalIcon } from "../assets/images/goal.svg";
import { ReactComponent as EditIcon } from "../assets/images/pencil.svg";
import { ReactComponent as DeleteIcon } from "../assets/images/delete.svg";
import { Skeleton, Stack, Text, useToast } from "@chakra-ui/react";
import DeleteDialog from "../components/Dialogs/DeleteDialog";
import EditDialog from "../components/Dialogs/EditDialog";
import AddActionDialog from "../components/Tasks/AddActionDialog";
import { default as GoalDialog } from "../components/Dialogs/ApproveDialog";
import { default as ClaimDialog } from "../components/Dialogs/ApproveDialog";
import { useNavigate } from "react-router-dom";
import RemoveGoalDialog from "../components/Dialogs/RemoveGoalDialog";
import { noGoalEntity } from "../utils/constants";
import { ChildContext } from "../contexts/ChildContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Rewards = () => {
  const { actor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [rewards, setRewards] = React.useState([]);
  const [currentGoal, setCurrentGoal] = React.useState(null);
  const { child, setChild } = React.useContext(ChildContext);
  const [loader, setLoader] = React.useState({
    init: true,
    singles: false,
    child: !child ? true : false,
  });
  const [selectedReward, setSelectedReward] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    claim: false,
    goal: false,
    add_reward: false,
    remove_goal: false,
  });

  React.useEffect(() => {
    getChildren();
  }, []);

  React.useEffect(() => {
    if (child) {
      setLoader((prevState) => ({
        ...prevState,
        child: false,
      }));
    }
  }, [child]);
  const getChildren = async () => {
    await get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([
        get(`balance-${data}`),
        get(`selectedChildName`),
      ]);
      if (data) {
        setChild({
          id: data,
          balance: parseInt(balance),
          name,
        });
      } else {
        navigate("/");
      }
    });
  };

  async function getBalance(childID) {
    return new Promise((resolve, reject) => {
      get("balance-" + childID)
        .then((val) => {
          actor?.getBalance(childID).then((returnedBalance) => {
            set("balance-" + childID, parseInt(returnedBalance));
            resolve(returnedBalance);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  function getRewards({ disableFullLoader, callService = false }) {
    if (child.id) {
      if (!disableFullLoader) {
        setLoader((prevState) => ({ ...prevState, init: true }));
      }

      get("rewardList")
        .then(async (val) => {
          if (val === undefined || callService) {
            actor?.getGoals(child.id).then(async (returnedRewards) => {
              if ("ok" in returnedRewards) {
                const rewards = Object.values(returnedRewards);
                let currentGoalId;
                await actor?.getCurrentGoal(child.id).then((returnedGoal) => {
                  currentGoalId = parseInt(returnedGoal);

                  return currentGoalId;
                });
                const filteredRewards = rewards?.[0].map((reward) => {
                  return {
                    ...reward,
                    value: parseInt(reward.value),
                    id: parseInt(reward.id),
                    active:
                      currentGoalId === parseInt(reward.id) ? true : false,
                  };
                });
                set("rewardList", filteredRewards || []);
                setRewards(filteredRewards);
                setLoader((prevState) => ({
                  ...prevState,
                  init: false,
                  singles: false,
                }));
              } else {
                console.error(returnedRewards.err);
              }
            });
          } else {
            setRewards(
              val?.map((reward) => {
                return {
                  ...reward,
                  id: parseInt(reward.id),
                  value: parseInt(reward.value),
                };
              })
            );
            setLoader((prevState) => ({
              ...prevState,
              init: false,
              singles: false,
            }));
          }
        })
        .catch(() => {
          removeErrorItem();
        });

      return false;
    }
  }

  const removeErrorItem = () => {
    if (rewards?.length) {
      toast({
        title: "An error occurred.",
        description: `Apologies, please try again later.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      const finalRewards = rewards.filter((reward) => !reward?.isLocal);
      set("rewardList", finalRewards);
      setRewards(finalRewards);
    } else {
      set("rewardList", []);
      setRewards([]);
    }
  };

  function updateReward(rewardID, rewardName, rewardValue) {
    const reward_object = {
      ...selectedReward,
      name: rewardName,
      value: rewardValue,
      id: rewardID,
      archived: false,
    };
    handleCloseEditPopup();
    let prevReward;
    // setLoader((prevState) => ({ ...prevState, init: true }));
    const updatedList = rewards.map((reward) => {
      if (reward.id === reward_object.id) {
        prevReward = reward;
        return reward_object;
      } else {
        return reward;
      }
    });
    setRewards(updatedList);
    set("rewardList", updatedList);
    actor
      ?.updateGoal(child.id, rewardID, reward_object)
      .then((response) => {
        if ("ok" in response) {
          getRewards({ disableFullLoader: true, callService: true });
        } else {
          const updatedList = rewards.map((reward) => {
            const updatedReward =
              reward.id === reward_object.id ? prevReward : reward;
            return updatedReward;
          });
          setRewards(updatedList);
          set("rewardList", updatedList);
        }
      })
      .finally(() => setSelectedReward(null));
  }

  function deleteReward(rewardID, rewardName, rewardValue) {
    const reward_object = {
      ...selectedReward,
      name: rewardName,
      value: rewardValue,
      id: rewardID,
      archived: true,
    };
    const finalRewards = rewards.filter((reward) => reward.id !== rewardID);
    setRewards(finalRewards);
    set("rewardList", finalRewards);
    handleCloseDeletePopup();
    // setLoader((prevState) => ({ ...prevState, init: true }));
    actor
      ?.updateGoal(child.id, rewardID, reward_object)
      .then((response) => {
        if ("ok" in response) {
          getRewards({ disableFullLoader: true, callService: true });
        } else {
          setRewards((prevState) => {
            set("rewardList", [...prevState, reward_object]);
            return [...prevState, reward_object];
          });
          toast({
            title: "An error occurred.",
            description: `Can't perform delete, please try again later.`,
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      })
      .finally(() => setSelectedReward(null));
  }

  const handleTogglePopup = (isOpen, reward, popup) => {
    setSelectedReward(reward);
    setShowPopup((prevState) => ({ ...prevState, [popup]: isOpen }));
  };

  function handleSetGoal({ reward_id, isForSet, disableFullLoader }) {
    if (isForSet) {
      handleToggleGoalPopup();
      set("childGoal", {
        hasGoal: true,
        value: parseInt(selectedReward.value),
        name: selectedReward.name,
        id: parseInt(selectedReward.id),
      });
      const finalRewards = rewards.map((reward) => {
        if (reward.id === reward_id) {
          return { ...reward, active: true };
        } else {
          return reward;
        }
      });
      setRewards(finalRewards);
      set("rewardList", finalRewards);
    } else {
      set("childGoal", noGoalEntity);
      handleCloseRemoveGoalPopup();
      const finalRewards = rewards.map((reward) => {
        if (reward.id === selectedReward.id) {
          return { ...reward, active: false };
        } else {
          return reward;
        }
      });
      setRewards(finalRewards);
      set("rewardList", finalRewards);
    }
    // if (!disableFullLoader) {
    // setLoader((prevState) => ({ ...prevState, init: true }));
    // }
    // API call currentGoal
    actor?.currentGoal(child.id, reward_id).then((returnedCurrentGoal) => {
      if ("ok" in returnedCurrentGoal) {
        setCurrentGoal(reward_id);
        if (isForSet) {
          toast({
            title: `Good luck achieving your goal, ${child.name}.`,
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        } else {
          toast({
            title: `Goal removed for ${child.name}.`,
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        }
        getRewards({ disableFullLoader: true, callService: true });
      } else {
        console.error(returnedCurrentGoal.err);
        const finalRewards = rewards.map((reward) => {
          if (reward.id === reward_id) {
            return { ...reward, active: isForSet ? false : isForSet };
          } else {
            return reward;
          }
        });
        setRewards(finalRewards);
        set("rewardList", finalRewards);
      }
    });
  }

  function handleClaimReward(reward_id) {
    handleToggleClaimPopup();
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor
      ?.claimGoal(child.id, reward_id, date)
      .then(async (returnedClaimReward) => {
        if ("ok" in returnedClaimReward) {
          toast({
            title: `Yay - well deserved, ${child.name}.`,
            status: "success",
            duration: 4000,
            isClosable: true,
          });
          actor?.getChildren().then(async (returnedChilren) => {
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
            set("childList", updatedChildrenData);
            await getChildren();
            setLoader((prevState) => ({ ...prevState, init: false }));
          });
        } else {
          setLoader((prevState) => ({ ...prevState, init: false }));
        }
      });
  }

  React.useEffect(() => {
    if (child) getRewards(child);
  }, [actor, child]);

  const trailingActions = React.useCallback(
    ({ reward }) => (
      <TrailingActions>
        {child.balance >= reward.value ? (
          <SwipeAction
            onClick={() => handleTogglePopup(true, reward, "claim")}
            className="approve"
          >
            <div className="action-btn ">
              <div className="ItemColumnCentered">
                <ApproveIcon width="22px" height="22px" />
                <Text fontSize={"xs"} color={"#fff"}>
                  Claim
                </Text>
              </div>
            </div>
          </SwipeAction>
        ) : (
          <>
            {reward.active ? (
              <SwipeAction
                onClick={() => handleTogglePopup(true, reward, "remove_goal")}
                className="claim-option"
              >
                <div className="action-btn ">
                  <div className="ItemColumnCentered">
                    <GoalIcon width="22px" height="22px" />
                    <Text fontSize={"xs"} color={"#fff"}>
                      Remove
                    </Text>
                  </div>
                </div>
              </SwipeAction>
            ) : (
              <SwipeAction
                onClick={() => handleTogglePopup(true, reward, "goal")}
                className="claim-option"
              >
                <div className="action-btn ">
                  <div className="ItemColumnCentered">
                    <GoalIcon width="22px" height="22px" />
                    <Text fontSize={"xs"} color={"#fff"}>
                      Goal
                    </Text>
                  </div>
                </div>
              </SwipeAction>
            )}
          </>
        )}

        <SwipeAction
          className="edit"
          onClick={() => handleTogglePopup(true, reward, "edit")}
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
          onClick={() => handleTogglePopup(true, reward, "delete")}
        >
          <div className="action-btn ">
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
    [child]
  );

  const handleCloseDeletePopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["delete"]: false }));
  };

  const handleCloseEditPopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["edit"]: false }));
  };

  const handleToggleAddRewardPopup = () => {
    setShowPopup((prevState) => ({
      ...prevState,
      ["add_reward"]: !prevState.add_reward,
    }));
  };

  const handleToggleClaimPopup = () => {
    setShowPopup((prevState) => ({
      ...prevState,
      ["claim"]: !prevState.claim,
    }));
  };

  const handleCloseRemoveGoalPopup = () => {
    setShowPopup((prevState) => ({
      ...prevState,
      ["remove_goal"]: !prevState.remove_goal,
    }));
  };

  const handleToggleGoalPopup = () => {
    setShowPopup((prevState) => ({
      ...prevState,
      ["goal"]: !prevState.goal,
    }));
  };

  const handleSubmitReward = (rewardName, value) => {
    if (rewardName) {
      const reward = {
        name: rewardName,
        value: parseInt(value),
        active: false,
        archived: false,
        id: rewards?.[0]?.id + 1 || 1,
        isLocal: true,
      };
      setRewards((prevState) => {
        set("rewardList", [reward, ...prevState]);
        return [reward, ...prevState];
      });
      // setLoader((prevState) => ({ ...prevState, singles: true }));
      handleToggleAddRewardPopup();
      actor
        .addGoal(reward, child.id)
        .then((response) => {
          if ("ok" in response) {
            getRewards({ disableFullLoader: true, callService: true });
          } else {
            removeErrorItem();
          }
        })
        .catch((error) => {
          removeErrorItem();
        });
    }
  };

  const RewardList = React.useMemo(() => {
    return (
      <>
        {rewards?.length ? (
          <div className="example">
            <ul className="list-wrapper">
              <SwipeableList
                threshold={0.25}
                type={ListType.IOS}
                fullSwipe={false}
              >
                {rewards.map((reward) => (
                  <SwipeableListItem
                    leadingActions={null}
                    trailingActions={trailingActions({ reward })}
                    key={reward.id}
                  >
                    <div className="list-item" key={parseInt(reward.id)}>
                      <div>{reward.name}</div>
                      <div>
                        <img
                          src={dc}
                          className="dc-img-small"
                          alt="DooCoins symbol"
                        />
                        {parseInt(reward.value)}
                      </div>
                    </div>
                  </SwipeableListItem>
                ))}
              </SwipeableList>
            </ul>
          </div>
        ) : null}
      </>
    );
  }, [rewards]);

  const isModalOpen =
    showPopup.delete ||
    showPopup.edit ||
    showPopup.claim ||
    showPopup.goal ||
    showPopup.add_reward ||
    showPopup.remove_goal;

  if (loader.child) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {showPopup.delete && (
        <DeleteDialog
          selectedItem={selectedReward}
          handleCloseDeletePopup={handleCloseDeletePopup}
          handleDelete={(childId) =>
            deleteReward(
              parseInt(selectedReward.id),
              selectedReward.name,
              parseInt(selectedReward.value)
            )
          }
        />
      )}
      {showPopup.remove_goal && (
        <RemoveGoalDialog
          selectedItem={selectedReward}
          handleClosePopup={handleCloseRemoveGoalPopup}
          handleRemove={() =>
            handleSetGoal({
              reward_id: 0,
              isForSet: false,
              disableFullLoader: false,
            })
          }
        />
      )}
      {showPopup.edit && (
        <EditDialog
          handleCloseEditPopup={handleCloseEditPopup}
          selectedItem={selectedReward}
          handleSubmitForm={(rewardId, rewardName, rewardValue) =>
            updateReward(
              parseInt(selectedReward.id),
              rewardName,
              parseInt(rewardValue)
            )
          }
        />
      )}
      {showPopup.claim && (
        <ClaimDialog
          handleClosePopup={handleToggleClaimPopup}
          selectedItem={selectedReward}
          handleApprove={() => handleClaimReward(parseInt(selectedReward.id))}
          submitBtnLabel="Claim Reward"
        />
      )}
      {showPopup.goal && (
        <GoalDialog
          handleClosePopup={handleToggleGoalPopup}
          selectedItem={selectedReward}
          handleApprove={() =>
            handleSetGoal({
              reward_id: parseInt(selectedReward.id),
              isForSet: true,
              disableFullLoader: false,
            })
          }
          submitBtnLabel="Set Goal"
        />
      )}
      {showPopup.add_reward && (
        <AddActionDialog
          handleSubmitForm={handleSubmitReward}
          handleClosePopup={handleToggleAddRewardPopup}
          title="Add a Reward"
          namePlaceHolder="Reward Name"
          valuePlaceHolder="Reward Value"
        />
      )}
      <Balance
        isModalOpen={isModalOpen ? modelStyles.blur_background : undefined}
        childName={child?.name}
        childBalance={child?.balance}
      />

      <div
        className={`${
          isModalOpen ? modelStyles.blur_background : undefined
        } light-panel`}
      >
        <div className={`panel-header-wrapper`}>
          <h2 className="title-button dark">
            <span>Rewards</span>{" "}
            <span
              role="button"
              onClick={handleToggleAddRewardPopup}
              className="plus-sign"
            />
          </h2>
        </div>
        {loader.init ? (
          <Stack margin={"0 20px 20px 20px"}>
            <Skeleton height="20px" />
            <Skeleton height="20px" mt={"12px"} />
            <Skeleton height="20px" mt={"12px"} />
          </Stack>
        ) : (
          <>{RewardList}</>
        )}
        {loader.singles ? (
          <Stack margin={"0 20px 20px 20px"}>
            <Skeleton height="20px" mt={"12px"} />
          </Stack>
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
};

export default Rewards;
