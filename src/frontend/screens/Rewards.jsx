import * as React from "react";
import { get } from "idb-keyval";
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

const Rewards = () => {
  const { actor } = useAuth();
  const toast = useToast();
  const [rewards, setRewards] = React.useState([]);
  const [rewardClaimed, setRewardClaimed] = React.useState(null);
  const [newReward, setNewReward] = React.useState(null);
  const [currentGoal, setCurrentGoal] = React.useState(null);
  const [loader, setLoader] = React.useState({ init: true, singles: false });
  const [child, setChild] = React.useState(null);
  const [selectedReward, setSelectedReward] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    claim: false,
    goal: false,
    add_reward: false,
  });

  React.useEffect(() => {
    setLoader((prevState) => ({ ...prevState, init: true }));
    getChildren();
  }, []);

  const getChildren = async () => {
    await get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([
        get(`balance-${data}`),
        get(`selectedChildName`),
      ]);
      setChild({
        id: data,
        balance: parseInt(balance),
        name,
      });
    });
  }

  function getRewards({ disableFullLoader }) {
    if (child) {
      if (!disableFullLoader) {
        setLoader((prevState) => ({ ...prevState, init: true }));
      }
      actor?.getGoals(child.id).then((returnedRewards) => {
        if ("ok" in returnedRewards) {
          const rewards = Object.values(returnedRewards);
          setRewards(
            rewards[0].map((reward) => {
              return {
                ...reward,
                value: parseInt(reward.value),
                id: parseInt(reward.id),
              };
            })
          );
          setLoader((prevState) => ({
            ...prevState,
            init: false,
            singles: false,
          }));
        } else {
          console.error(returnedRewards.err);
        }
      });
      return false;
    }
  }

  function updateReward(rewardID, rewardName, rewardValue) {
    const reward_object = {
      name: rewardName,
      value: rewardValue,
      id: rewardID,
      archived: false,
    };
    handleCloseEditPopup();
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor
      ?.updateGoal(child.id, rewardID, reward_object)
      .then((response) => {
        getRewards({ disableFullLoader: false });
      })
      .finally(() => setSelectedReward(null));
  }

  function deleteReward(rewardID, rewardName, rewardValue) {
    const reward_object = {
      name: rewardName,
      value: rewardValue,
      id: rewardID,
      archived: true,
    };
    handleCloseDeletePopup();
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor
      ?.updateGoal(child.id, rewardID, reward_object)
      .then((response) => {
        getRewards({ disableFullLoader: false });
      })
      .finally(() => setSelectedReward(null));
  }

  const handleTogglePopup = (isOpen, reward, popup) => {
    setSelectedReward(reward);
    setShowPopup((prevState) => ({ ...prevState, [popup]: isOpen }));
  };

  function handleSetGoal(reward_id) {
    handleToggleGoalPopup();
    // API call currentGoal
    actor?.currentGoal(child.id, reward_id).then((returnedCurrentGoal) => {
      if ("ok" in returnedCurrentGoal) {
        setCurrentGoal(reward_id);
        toast({
          title: `Goal is set to ${child.name}.`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      } else {
        console.error(returnedCurrentGoal.err);
      }
    });
  }

  function handleClaimReward(reward_id) {
    handleToggleClaimPopup();
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();
    setLoader((prevState) => ({ ...prevState, init: true }));
    actor?.claimGoal(child.id, reward_id, date).then(async (returnedClaimReward) => {
      if ("ok" in returnedClaimReward) {
        toast({
          title: `Reward is claimed for ${child.name}.`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        setRewardClaimed(parseInt(reward_id));
        await getChildren();
        setLoader((prevState) => ({ ...prevState, init: false }));
      } else {
        console.error(returnedClaimReward.err);
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
      };
      setLoader((prevState) => ({ ...prevState, singles: true }));
      handleToggleAddRewardPopup();
      actor.addGoal(reward, child.id).then((response) => {
        if ("ok" in response) {
          getRewards({ disableFullLoader: true });
        }
      });
    }
  };

  const RewardList = React.useMemo(() => {
    return (
      <>
        {rewards?.length && (
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
        )}
      </>
    );
  }, [rewards]);

  const isModalOpen =
    showPopup.delete ||
    showPopup.edit ||
    showPopup.claim ||
    showPopup.goal ||
    showPopup.add_reward;

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
          handleApprove={() => handleSetGoal(parseInt(selectedReward.id))}
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
