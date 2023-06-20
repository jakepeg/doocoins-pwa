import * as React from "react";
import { get } from "idb-keyval";
import Balance from "../components/Balance";
import LoadingSpinner from "../components/LoadingSpinner";
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
import { Text, useToast } from "@chakra-ui/react";
import DeleteDialog from "../components/Dialogs/DeleteDialog";
import EditDialog from "../components/Dialogs/EditDialog";
import AddActionDialog from "../components/Tasks/AddActionDialog";

const Rewards = () => {
  const { actor, logout } = useAuth();
  const toast = useToast()
  const [rewards, setRewards] = React.useState({});
  const [rewardClaimed, setRewardClaimed] = React.useState(null);
  const [newReward, setNewReward] = React.useState(null);
  const [currentGoal, setCurrentGoal] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [child, setChild] = React.useState(null);
  const [selectedReward, setSelectedReward] = React.useState(null);
  const [showPopup, setShowPopup] = React.useState({
    delete: false,
    edit: false,
    claim: false,
    goal: false,
    approve: false,
    add_reward: false,
  });
  
  React.useEffect(() => {
    setIsLoading(true);
    get("selectedChild").then(async (data) => {
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
  }, []);

  function getRewards() {
    if (child) {
      console.log("getRewards called for child id: " + child);
      setIsLoading(true);
      actor?.getGoals(child.id).then((returnedRewards) => {
        if ("ok" in returnedRewards) {
          const rewards = Object.values(returnedRewards);
          setRewards(rewards);
          setIsLoading(false);
        } else {
          console.error(returnedRewards.err);
        }
      });
      return false;
    }
  }

  // add swiper - delete, edit, claim reward, set goal
  function handleAddReward(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll("input");
    const reward_name = e.target.querySelector(
      'input[name="reward_name"]'
    ).value;
    const reward_value = parseInt(
      e.target.querySelector('input[name="reward_value"]').value
    );
    const reward_object = { name: reward_name, value: reward_value };
    actor?.addGoal(reward_object, child.id).then((returnedAddReward) => {
      if ("ok" in returnedAddReward) {
        setNewReward(reward_name);
        inputs.forEach((input) => {
          input.value = "";
        });
      } else {
        console.error(returnedAddReward.err);
      }
    });
    return false;
  }

  const handleTogglePopup = (isOpen, reward, popup) => {
    setSelectedReward(reward);
    setShowPopup((prevState) => ({ ...prevState, [popup]: isOpen }));
  };

  function handleSetGoal(reward_id) {
    // API call currentGoal
    actor?.currentGoal(child.id, reward_id).then((returnedCurrentGoal) => {
      console.log(`returnedCurrentGoal`, returnedCurrentGoal)
      if ("ok" in returnedCurrentGoal) {
        setCurrentGoal(reward_id);
        toast({
          title: `Goal is set to ${child.name}.`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
      } else {
        console.error(returnedCurrentGoal.err);
      }
    });
  }

  function handleClaimReward(reward_id) {
    let r = window.confirm("Are you sure?");
    if (r == true) {
      let dateNum = Math.floor(Date.now() / 1000);
      let date = dateNum.toString();
      actor
        ?.claimGoal(child.id, reward_id, date)
        .then((returnedClaimReward) => {
          if ("ok" in returnedClaimReward) {
            setRewardClaimed(parseInt(reward_id));
          } else {
            console.error(returnedClaimReward.err);
          }
        });
    } else {
      console.log("You pressed cancel!");
    }
  }

  React.useEffect(() => {
    if (child) getRewards(child);
  }, [actor, child]);

  const trailingActions = ({ reward }) => (
    <TrailingActions>
      <SwipeAction
        onClick={() => handleTaskComplete(parseInt(reward.id))}
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
      <SwipeAction
        onClick={() => handleSetGoal(parseInt(reward.id))}
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

  const handleSubmitReward = (rewardName, value) => {
    if (rewardName) {
      const reward = {
        name: rewardName,
        value: parseInt(value),
      };
      console.log(`reward`, reward);
      handleToggleAddRewardPopup();
      actor.addGoal(reward, child.id).then((response) => {
        console.log(`response added`, response);
        getRewards();
      });
    }
  };

  const isModalOpen =
    showPopup.delete ||
    showPopup.edit ||
    showPopup.claim ||
    showPopup.goal ||
    showPopup.add_reward;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {showPopup.delete && (
        <DeleteDialog
          selectedChild={selectedReward}
          handleCloseDeletePopup={handleCloseDeletePopup}
        />
      )}
      {showPopup.edit && (
        <EditDialog
          handleCloseEditPopup={handleCloseEditPopup}
          selectedChild={selectedReward}
        />
      )}
      {showPopup.add_reward && (
        <AddActionDialog
          handleSubmitTask={handleSubmitReward}
          handleClosePopup={handleToggleAddRewardPopup}
          title="Add Reward"
          namePlaceHolder="Reward Name"
          valuePlaceHolder="Reward Value"
        />
      )}
      <Balance
        isModalOpen={isModalOpen ? modelStyles.blur_background : undefined}
        childName={child.name}
        childBalance={child.balance}
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
        {rewards?.length && (
          <>
            <SwipeableList
              threshold={0.25}
              type={ListType.IOS}
              fullSwipe={false}
            >
              {rewards[0].map((reward) => (
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
          </>
        )}
      </div>
    </>
  );
};

export default Rewards;
