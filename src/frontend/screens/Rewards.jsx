import * as React from "react";
import { get } from "idb-keyval";
import Balance from "../components/Balance";
import LoadingSpinner from "../components/LoadingSpinner";
import dc from "../assets/images/dc.svg";
import { useAuth } from "../use-auth-client";

const Rewards = () => {
  const {actor,logout} = useAuth()
  const [rewards, setRewards] = React.useState({});
  const [rewardClaimed, setRewardClaimed] = React.useState(null);
  const [newReward, setNewReward] = React.useState(null);
  const [currentGoal, setCurrentGoal] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [child, setChild] = React.useState(null);

  React.useEffect(() => {
    setIsLoading(true)
    get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([get(`balance-${data}`), get(`selectedChildName`)])
      setChild({
        id: data,
        balance: parseInt(balance),
        name
      });
    })
  }, [])


  function getRewards() {
    if (child) {
      console.log("getRewards called for child id: "+child);
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
    const reward_name = e.target.querySelector('input[name="reward_name"]').value;
    const reward_value = parseInt(e.target.querySelector('input[name="reward_value"]').value);
    const reward_object = {name:reward_name,value:reward_value};
    actor?.addGoal(reward_object,selectedChild).then((returnedAddReward) => {
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

  function handleSetGoal(reward_id) {
    // API call currentGoal
    actor?.currentGoal(selectedChild,reward_id).then((returnedCurrentGoal) => {
      if ("ok" in returnedCurrentGoal) {
        setCurrentGoal(reward_id);
        ref.current.toggle();
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
      actor?.claimGoal(selectedChild,reward_id,date).then((returnedClaimReward) => {
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

  if(isLoading) {
    return  <LoadingSpinner />
  }

  return (
    <>
      <Balance childName={child.name} childBalance={child.balance} />

      <div className="light-panel">
        <h2 className="title-button dark"><span>Rewards</span> <span className="plus-sign"></span></h2>
        {isLoading ? <LoadingSpinner /> : null}
        {rewards.length > 0 &&
          rewards[0].map((reward) => (
            <div
              className="list-item"
              role="button"
              key={parseInt(reward.id)}
              onClick={() => handleClaimReward(parseInt(reward.id))}
              onKeyDown={() => handleClaimReward(parseInt(reward.id))}
            >
              <div>{reward.name}</div>
              <div>
                <img src={dc} className="dc-img-small" alt="DooCoins symbol" />
                {parseInt(reward.value)}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Rewards;