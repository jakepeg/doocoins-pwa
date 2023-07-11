import * as React from "react";
import dc from "../assets/images/dc-thin-white.svg";
import GoalIcon from "../assets/images/card-header/card-header-claim-2.svg";
import NoGoalIcon from "../assets/images/card-header/card-header-no-goal-2.svg";
import PlainGoalBackground from "../assets/images/card-header/card-dc.svg";
import styles from "../assets/css/golabal.module.css";
import { Box, useToast } from "@chakra-ui/react";
import { get, set } from "idb-keyval";
import { ChildContext } from "../contexts/ChildContext";
import { useAuth } from "../use-auth-client";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Balance = (props) => {
  const { child, setChild, goal, setGoal, getBalance, handleUnsetGoal } =
    React.useContext(ChildContext);
  const { actor } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const balance = child?.balance || 0;
  const navigate = useNavigate();
  const toast = useToast();
  const [transactions, setTransactions] = React.useState([]);

  React.useEffect(() => {
    get("childGoal").then(async (data) => {
      if (data) {
        setGoal({
          name: data.name,
          value: parseInt(data.value),
          hasGoal: data.hasGoal,
          ...data,
        });
        setIsLoading(false);
      }
    });
  }, [props.childBalance]);

  function getTransactions() {
    get("transactionList").then(async (val) => {
      setTransactions(val || []);
    });
  }

  React.useEffect(() => {
    getTransactions();
  }, []);

  const handleUpdateTransactions = (transactions) => {
    setTransactions(transactions);
    set("transactionList", transactions);
  };

  function handleClaimGoal() {
    const reward_id = goal.id;
    let dateNum = Math.floor(Date.now() / 1000);
    let date = dateNum.toString();
    setIsLoading(true);
    const new_transactions = {
      completedDate: date,
      id: transactions?.[0]?.id ? parseInt(transactions?.[0]?.id) + 1 : 1,
      value: goal.value,
      name: goal.name,
      transactionType: "GOAL_DEBIT",
    };
    handleUpdateTransactions([new_transactions, ...transactions]);
    actor
      ?.claimGoal(child.id, reward_id, date)
      .then(async (returnedClaimReward) => {
        if ("ok" in returnedClaimReward) {
          handleUnsetGoal();
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
          handleUpdateTransactions(
            transactions.filter(
              (transaction) => transaction.id !== new_transactions.id
            )
          );
        }
      })
      .finally(() => setIsLoading(false));
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
  const percentage = (
    (Number(props.childBalance) / Number(goal?.value)) *
    100
  ).toFixed(0);
  const isAbleToClaim = balance >= goal?.value && goal?.value > 0;

  const handleGoalClick = () => {
    if (isAbleToClaim) {
      handleClaimGoal();
    }
  };

  return (
    <>
      <header
        style={{
          backgroundImage: `url(${
            !goal?.hasGoal
              ? NoGoalIcon
              : isAbleToClaim
              ? GoalIcon
              : goal?.hasGoal
              ? PlainGoalBackground
              : null
          })`,
        }}
        className={`${styles.hero} ${props.isModalOpen}`}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          height={"100%"}
        >
          <Box display={"flex"} flexDirection={"column"} gap={0}>
            <Box className={styles.name}>{props.childName}</Box>
            {props.childBalance >= 0 && (
              <Box className={styles.balance}>
                <img src={dc} className="dc-img-big" alt="DooCoins symbol" />
                {props.childBalance}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              background: "transparent",
              zIndex: 99999,
              minWidth: isAbleToClaim && "25%",
              minHeight: isAbleToClaim && "100px",
              transform: isAbleToClaim && `translateX(-20px)`,
              cursor: isAbleToClaim && "pointer",
            }}
            onClick={handleGoalClick}
          >
            {goal?.hasGoal && isAbleToClaim && (
              <p
                className={styles.claim_goal_text}
                style={{ color: "#fff", marginTop: "4px" }}
              >
                {goal.name}
              </p>
            )}
            {goal?.hasGoal && !isAbleToClaim ? (
              <>
                <Box
                  display={"flex"}
                  className={styles.circular_progress}
                  flexDirection={"column"}
                  alignItems={"center"}
                  sx={{
                    width: { base: 120, sm: 200, md: 280 },
                    height: { base: 160, sm: 200, md: 280 },
                    maxHeight: "320px"
                  }}
                >
                  <CircularProgressbar
                    value={percentage}
                    text={`${percentage}%`}
                    background
                    backgroundPadding={6}
                    strokeWidth={5}
                    styles={buildStyles({
                      strokeLinecap: "butt",
                      backgroundColor: "#0B334D",
                      textColor: "#fff",
                      pathColor: "#fff",
                      trailColor: "transparent",
                    })}
                  />
                  <p style={{ color: "#fff", marginTop: "4px" }}>{goal.name}</p>
                </Box>
              </>
            ) : null}
          </Box>
        </Box>
      </header>
    </>
  );
};

export default React.memo(Balance);
