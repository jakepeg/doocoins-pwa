import * as React from "react";
import { useAuth } from "../use-auth-client";
import { get } from "idb-keyval";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Box, SkeletonText } from "@chakra-ui/react";

const Goal = () => {
  const { actor } = useAuth();
  const [goal, setGoal] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [child, setChild] = React.useState(null);
  const balance = child?.balance || 0;

  React.useEffect(() => {
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
    actor
      ?.getGoals(child.id)
      .then((returnedRewards) => {
        if ("ok" in returnedRewards) {
          const rewards = Object.values(returnedRewards);
          if (rewards) {
            const { name, value, id } = rewards[0].find(
              (reward) => rewardId === parseInt(reward.id)
            );
            setGoal({
              name,
              goalId: id,
              value: parseInt(value),
              hasGoal: true,
            });
          }
        } else {
          console.error(returnedRewards.err);
        }
      })
      .finally(() => setIsLoading(false));
  };

  function getCurrentGoal() {
    console.log("IN CHILD", child)
    actor?.getCurrentGoal(child.id).then((returnedGoal) => {
      console.log(`returnedGoal`, returnedGoal)
      returnedGoal = parseInt(returnedGoal);
      console.log(`returnedGoal`, returnedGoal)
      if (returnedGoal > 0) {
        console.log("ncjfd")
        getReward(returnedGoal);
      } else {
        setGoal({
          name: "no goal set",
          value: 0,
          hasGoal: false,
        });
        setIsLoading(false)
      }
    }).catch((e) => console.log('error', e));
    return false;
  }

  if (isLoading) {
    return (
      <>
        <Box
          style={{ maxWidth: "380px", display: "flex", flexDirection: "column", margin: "-50px auto 20px auto", borderRadius: "8px" }}
          padding={'20px'}
          boxShadow="none"
          bg="white"
        >
          <SkeletonText mt="4" noOfLines={3} spacing="4" skeletonHeight="2" />
        </Box>
      </>
    );
  }

  if (!goal?.hasGoal) {
    return "";
  }

  return (
    <div className="goal">
      <div className="goal-info">
        <p className="goal-name">
          Current goal <br />
          {goal?.name}
        </p>
        <button
          disabled={!(balance >= goal?.value && goal.value > 0)}
          className={!(balance >= goal?.value && goal.value > 0) ? 'claim-disabled' : 'claim'}
          onClick={() => handleClaimGoal(parseInt(goal?.id))}
          >
          Claim
        </button>



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
