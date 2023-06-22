import * as React from "react";
import { useAuth } from "../use-auth-client";
import { set, get } from "idb-keyval";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Goal = () => {
  const { actor } = useAuth();
  // const [hasGoal, setHasGoal] = React.useState(false);
  // const [goalValue, setGoalValue] = React.useState(null);
  // const [goalName, setGoalName] = React.useState(null);
  // const [goalId, setGoalId] = React.useState(null);
  const [goal, setGoal] = React.useState(null);
  const [child, setChild] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const hasGoal = true;
  const goalValue = 200;
  const goalName = "New Beyblade";
  const goalId = 123;
  const balance = child?.balance || 0;

  React.useEffect(() => {
    // setIsLoading(true);
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

  React.useEffect(() => {
    if (child?.id) {
      get("childGoal").then(async (data) => {
        console.log("the data", data);
        if (data) {
        } else {
          getCurrentGoal();
        }
      });
    }
  }, [child?.id]);

  // check if goal for SELECTED CHILD is in local storage checkGoal()
  // if it is call
  // setGoalState {
  // setHasGoal(true);
  // setGoalName(goalName);
  // setGoalValue(goalValue);
  // setGoalId(goalId);
  // }
  // if the goal for the selected child isn't in local storage call getCurrentGoal()
  // and set local storage

  // claim goal button should open confirmation confirmation dialog CLAIM / CANCEL

  const getReward = (rewardId) => {
    actor?.getGoals(child.id).then((returnedRewards) => {
      if ("ok" in returnedRewards) {
        const rewards = Object.values(returnedRewards);
        if (rewards) {
          const { name, value, id } = rewards[0].find(
            (reward) => rewardId === parseInt(reward.id)
          );
          console.log(`goal`, goal);
          setGoal({ name, goalId: id, goalValue: value, hasGoal: true });
        }
      } else {
        console.error(returnedRewards.err);
      }
    });
  };

  function getCurrentGoal() {
    actor?.getCurrentGoal(child.id).then((returnedGoal) => {
      returnedGoal = parseInt(returnedGoal);
      console.log(`returnedGoal`, returnedGoal);
      if (returnedGoal > 0) {
        getReward(returnedGoal);
      } else {
        setGoal({
          name: "no goal set",
          value: 0,
          hasGoal: false
        });
      }
    });
    return false;
  }

  // function handleClaimGoal(goal_id) {
  //   let r = window.confirm("Are you sure?");
  //   if (r == true) {
  //     let dateNum = Math.floor(Date.now() / 1000);
  //     let date = dateNum.toString();
  //     // API call claimGoal
  //     actor?.claimGoal(selectedChild,goal_id,date).then((returnedClaimGoal) => {
  //       if ("ok" in returnedClaimGoal) {
  //         setGoalClaimed(parseInt(goal_id));
  //       } else {
  //         console.error(returnedClaimGoal.err);
  //       }
  //     });
  //   } else {
  //     console.log("You pressed cancel!");
  //   }
  // }

  // handleSetGoal(reward_id) is on Rewards.jsx

  // React.useEffect(() => {
  //   checkGoal();
  // }, [actor]);

  return (
    <div className="goal">
      <div className="goal-info">
        <p className="goal-name">
          Current goal <br />
          {goal?.name}
        </p>
        {balance >= goal?.value && goal.value > 0 && (
          <button
            className="claim"
            onClick={() => handleClaimGoal(parseInt(goalId))}
          >
            Claim
          </button>
        )}
      </div>
      {hasGoal && (
        <div className="goal-progress">
          <CircularProgressbar
            strokeWidth="12"
            value={balance}
            maxValue={goal?.value}
            text={`${balance}`}
            styles={buildStyles({
              strokeLinecap: "butt",
              textSize: "1.5em",
              pathColor: `hsl(184, 81%, 37%)`,
              textColor: "hsl(184, 81%, 37%)",
              trailColor: "hsl(205, 67%, 96%)",
            })}
          />
          <p className="goal-value">of {goal?.value}</p>
        </div>
      )}
    </div>
  );
};

export default Goal;
