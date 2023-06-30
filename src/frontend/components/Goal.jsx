import * as React from "react";
import { useAuth } from "../use-auth-client";
import { get, set } from "idb-keyval";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Box, SkeletonText, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { noGoalEntity } from "../utils/constants";

const Goal = ({ child, setChild }) => {
  const { actor } = useAuth();
  const [goal, setGoal] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const balance = child?.balance || 0;
  const navigate = useNavigate();
  const toast = useToast();

  React.useEffect(() => {
    if (child?.id && actor) {
      get("childGoal").then(async (data) => {
        if (data) {
          setGoal({
            name: data.name,
            value: parseInt(data.value),
            hasGoal: data.hasGoal,
            ...data,
          });
          setIsLoading(false);
        } else {
          getCurrentGoal();
        }
      });
    }
  }, [child?.id, actor]);

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
            const returnedGoal = {
              name,
              value: parseInt(value),
              hasGoal: true,
              id,
            };
            set("childGoal", returnedGoal);
            setGoal(returnedGoal);
          }
        } else {
          console.error(returnedRewards.err);
        }
      })
      .finally(() => setIsLoading(false));
  };

  function getCurrentGoal() {
    actor
      ?.getCurrentGoal(child.id)
      .then((returnedGoal) => {
        returnedGoal = parseInt(returnedGoal);
        if (returnedGoal > 0) {
          getReward(returnedGoal);
        } else {
          setGoal(noGoalEntity);
          set("childGoal", noGoalEntity);
          setIsLoading(false);
        }
      })
      .catch((e) => console.log("error", e));
    return false;
  }

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

  function handleClaimGoal(reward_id) {
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();
    setIsLoading(true);
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
          getReward(reward_id);
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
            setIsLoading(false);
          });
        } else {
          console.error(returnedClaimReward.err);
        }
      })
      .finally(() => setIsLoading(false));
  }

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

  if (isLoading) {
    return (
      <>
        <Box
          style={{
            maxWidth: "380px",
            display: "flex",
            flexDirection: "column",
            margin: "-50px auto 20px auto",
            borderRadius: "8px",
          }}
          padding={"20px"}
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
          className={
            !(balance >= goal?.value && goal.value > 0)
              ? "claim-disabled"
              : "claim"
          }
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
