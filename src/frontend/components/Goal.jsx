import * as React from "react";
import { useAuth } from "../use-auth-client";
import { set, get } from "idb-keyval";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Goal = () => {
  const { actor } = useAuth();
  const [goal, setGoal] = React.useState(null);
  const [child, setChild] = React.useState(null);

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
        if (data) {
        } else {
          getCurrentGoal();
        }
      });
    }
  }, [child?.id]);

  const getReward = (rewardId) => {
    actor?.getGoals(child.id).then((returnedRewards) => {
      if ("ok" in returnedRewards) {
        const rewards = Object.values(returnedRewards);
        if (rewards) {
          const { name, value, id } = rewards[0].find(
            (reward) => rewardId === parseInt(reward.id)
          );
          setGoal({ name, goalId: id, value: parseInt(value), hasGoal: true });
        }
      } else {
        console.error(returnedRewards.err);
      }
    });
  };

  function getCurrentGoal() {
    actor?.getCurrentGoal(child.id).then((returnedGoal) => {
      returnedGoal = parseInt(returnedGoal);
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

  if(!goal?.hasGoal) {
    return ""
  }

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
            onClick={() => handleClaimGoal(parseInt(goal?.id))}
          >
            Claim
          </button>
        )}
      </div>
      {goal.hasGoal && (
        <div className="goal-progress">
          <CircularProgressbar
            strokeWidth="12"
            value={balance?.toString()}
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
