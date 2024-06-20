import * as React from "react";
import { get, set } from "idb-keyval";
import Balance from "../components/Balance";
import dc from "../assets/images/dc.svg";
import { ReactComponent as DotArrow } from "../assets/images/dotarrow.svg";
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
import { ReactComponent as TickIcon } from "../assets/images/tick.svg";
import {
  Box,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import DeleteDialog from "../components/Dialogs/DeleteDialog";
import EditDialog from "../components/Dialogs/EditDialog";
import AddActionDialog from "../components/Tasks/AddActionDialog";
import { default as GoalDialog } from "../components/Dialogs/ApproveDialog";
import { default as ClaimDialog } from "../components/Dialogs/ApproveDialog";
import { useNavigate } from "react-router-dom";
import RemoveGoalDialog from "../components/Dialogs/RemoveGoalDialog";
import strings, { noGoalEntity } from "../utils/constants";
import { ChildContext } from "../contexts/ChildContext";
import LoadingSpinner from "../components/LoadingSpinner";
import SwipeListCallout from "../components/Callouts/SwipeListCallout";
import AddRewardCalloutWrapper from "../components/Rewards/AddRewardCalloutWrapper";
import ChildReward from "../components/Rewards/ChildReward";

const Rewards = () => {
  const { actor, store } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [rewards, setRewards] = React.useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentGoal, setCurrentGoal] = React.useState(null);
  const {
    child,
    setChild,
    setGoal,
    isNewToSystem,
    handleUpdateCalloutState,
    blockingChildUpdate,
    setBlockingChildUpdate,
  } = React.useContext(ChildContext);
  const [transactions, setTransactions] = React.useState([]);

  const [loader, setLoader] = React.useState({
    init: true,
    singles: false,
    child: !child ? true : false,
  });
  const [addClicked, setAddClicked] = React.useState(false);
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
    if (isNewToSystem[strings.CALLOUT_REWARDS_LIST]) {
      onOpen();
    }
  }, [isNewToSystem[strings.CALLOUT_REWARDS_LIST]]);

  React.useEffect(() => {
    if (!blockingChildUpdate) {
      getChildren({});
    }
  }, []);

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

  async function getBalance(childID) {
    return new Promise((resolve, reject) => {
      get("balance-" + childID, store)
        .then((val) => {
          actor?.getBalance(childID).then((returnedBalance) => {
            set("balance-" + childID, parseInt(returnedBalance), store);
            resolve(returnedBalance);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  function getRewards({
    disableFullLoader,
    callService = false,
    revokeStateUpdate = false,
  }) {
    if (child.id) {
      if (!disableFullLoader) {
        setLoader((prevState) => ({ ...prevState, init: true }));
      }

      get("rewardList", store)
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
                set("rewardList", filteredRewards, store);
                if (!revokeStateUpdate) {
                  setRewards(filteredRewards);
                }
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
            if (!revokeStateUpdate) {
              setRewards(
                val?.map((reward) => {
                  return {
                    ...reward,
                    id: parseInt(reward.id),
                    value: parseInt(reward.value),
                  };
                })
              );
            }
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
      set("rewardList", finalRewards, store);
      setRewards(finalRewards);
    } else {
      set("rewardList", undefined, store);
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

    if (reward_object.active) {
      const returnedGoal = {
        hasGoal: true,
        value: parseInt(rewardValue),
        name: rewardName,
        id: parseInt(rewardID),
      };
      set("childGoal", returnedGoal, store);
      setGoal(returnedGoal);
    }
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
    set("rewardList", updatedList, store);
    actor?.updateGoal(child.id, rewardID, reward_object).then((response) => {
      if ("ok" in response) {
        getRewards({
          disableFullLoader: true,
          callService: true,
          revokeStateUpdate: true,
        });
      } else {
        const updatedList = rewards.map((reward) => {
          const updatedReward =
            reward.id === reward_object.id ? prevReward : reward;
          return updatedReward;
        });
        setRewards(updatedList);
        set("rewardList", updatedList, store);
      }
    });
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
    set("rewardList", finalRewards, store);
    handleCloseDeletePopup();
    // setLoader((prevState) => ({ ...prevState, init: true }));
    actor?.updateGoal(child.id, rewardID, reward_object).then((response) => {
      if ("ok" in response) {
        getRewards({
          disableFullLoader: true,
          callService: true,
          revokeStateUpdate: true,
        });
      } else {
        setRewards((prevState) => {
          set("rewardList", [...prevState, reward_object], store);
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
    });
  }

  const handleTogglePopup = (isOpen, reward, popup) => {
    setSelectedReward(reward);
    setShowPopup((prevState) => ({ ...prevState, [popup]: isOpen }));
  };

  function handleSetGoal({ reward_id, isForSet, disableFullLoader, selectedReward }) {
    if (isForSet) {
      // handleToggleGoalPopup();
      const returnedGoal = {
        hasGoal: true,
        value: parseInt(selectedReward.value),
        name: selectedReward.name,
        id: parseInt(selectedReward.id),
      };
      set("childGoal", returnedGoal, store);
      setGoal(returnedGoal);
      const finalRewards = rewards.map((reward) => {
        if (reward.id === reward_id) {
          return { ...reward, active: true };
        } else {
          return { ...reward, active: false };
        }
      });
      setRewards(finalRewards);
      set("rewardList", finalRewards, store);
    } else {
      set("childGoal", noGoalEntity, store);
      setGoal(noGoalEntity);
      // handleCloseRemoveGoalPopup();
      const finalRewards = rewards.map((reward) => {
        if (reward.id === selectedReward.id) {
          return { ...reward, active: false };
        } else {
          return reward;
        }
      });
      setRewards(finalRewards);
      set("rewardList", finalRewards, store);
    }
    // if (!disableFullLoader) {
    // setLoader((prevState) => ({ ...prevState, init: true }));
    // }
    // API call currentGoal
    actor
      ?.currentGoal(child.id, reward_id)
      .then(async (returnedCurrentGoal) => {
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
          getRewards({
            disableFullLoader: true,
            callService: true,
            revokeStateUpdate: true,
          });
          await getChildren({});
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
          set("rewardList", finalRewards, store);
        }
      });
  }

  function getTransactions() {
    get("transactionList", store).then(async (val) => {
      setTransactions(val || []);
    });
  }

  React.useEffect(() => {
    getTransactions();
  }, []);

  function handleClaimReward(reward_id) {
    handleToggleClaimPopup();
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();

    let maxIdObject = null;

    // Iterate through the data array to find the object with the highest "id"
    for (const item of transactions) {
      if (!maxIdObject || Number(item.id) > Number(maxIdObject.id)) {
        maxIdObject = item;
      }
    }

    const new_transactions = {
      completedDate: date,
      id: maxIdObject?.id ? parseInt(maxIdObject?.id) + 1 : 1,
      value: selectedReward.value,
      name: selectedReward.name,
      transactionType: "GOAL_DEBIT",
    };
    set("transactionList", [new_transactions, ...transactions], store);
    setTransactions([new_transactions, ...transactions]);
    setChild((prevState) => ({
      ...prevState,
      balance: prevState.balance - selectedReward.value,
    }));
    setBlockingChildUpdate(true);
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
            set("childList", updatedChildrenData, store);
            await getChildren({ revokeStateUpdate: true });
            setBlockingChildUpdate(false);
            setLoader((prevState) => ({ ...prevState, init: false }));
          });
        } else {
          const filteredTransactions = transactions.filter(
            (transaction) => transaction.id !== new_transactions.id
          );
          setTransactions(filteredTransactions);
          set("transactionList", filteredTransactions, store);
          setLoader((prevState) => ({ ...prevState, init: false }));
          setBlockingChildUpdate(false);
        }
      });
  }

  React.useEffect(() => {
    if (child) getRewards({ callService: true });
  }, [actor, child]);

  const handleCloseDeletePopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["delete"]: false }));
  };

  const handleCloseEditPopup = () => {
    setShowPopup((prevState) => ({ ...prevState, ["edit"]: false }));
  };

  const handleToggleAddRewardPopup = () => {
    setAddClicked(true);
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

  const handleReq = async (selectedReward) => {
    try {
      await actor.requestClaimReward(
        child.id,
        parseInt(selectedReward.id),
        parseInt(selectedReward.value),
        selectedReward.name
      );
      toast({
        title: `well done ${child.name}, the reward is pending`,
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

  const RewardList = React.useMemo(() => {
    return (
      <>
        {rewards?.length ? (
          <div className="example">
            <ul className="list-wrapper">
              {rewards.map((reward) => (
                <React.Fragment key={reward.id}>
                  <ChildReward
                    handleRemove={(selectedReward) => {
                      handleSetGoal({
                        reward_id: 0,
                        isForSet: false,
                        disableFullLoader: false,
                        selectedReward
                      });
                    }}
                    handleSetGoal={(selectedReward) => {
                      handleSetGoal({
                        reward_id: parseInt(selectedReward.id),
                        isForSet: true,
                        disableFullLoader: false,
                        selectedReward
                      });
                    }}
                    reward={reward}
                    child={child}
                    handleReq={(reward) => {
                      setSelectedReward(reward);
                      handleReq(reward);
                    }}
                    key={reward.id}
                  />
                </React.Fragment>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  }, [rewards, isOpen]);

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
          title={selectedReward.name}
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

      <div
        className={`${
          isModalOpen ? modelStyles.blur_background : undefined
        } light-panel max-w-screen`}
      >
        <div
          className={`panel-header-wrapper`}
          style={{ position: "relative" }}
        >
          <h2 className="title-button dark">
            <span>Rewards</span>{" "}
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
