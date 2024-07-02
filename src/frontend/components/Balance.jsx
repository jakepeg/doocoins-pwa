import * as React from "react";
import dc from "../assets/images/dc-thin-white.svg";
import GoalIcon from "../assets/images/card-header/cc-claim.svg";
import NoGoalIcon from "../assets/images/card-header/cc-nogoal.svg";
import PlainGoalBackground from "../assets/images/card-header/cc.svg";
import styles from "../assets/css/golabal.module.css";
import { Box, useToast } from "@chakra-ui/react";
import { get, set } from "idb-keyval";
import { ChildContext } from "../contexts/ChildContext";
import { useAuth } from "../use-auth-client";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { noGoalEntity } from "../utils/constants";

const Balance = () => {
  const {
    child,
    setChild,
    goal,
    setGoal,
    getBalance,
    handleUnsetGoal,
    setBlockingChildUpdate,
    blockingChildUpdate,
    transactions,
    setTransactions,
  } = React.useContext(ChildContext);
  const { actor } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const balance = child?.balance || 0;
  const navigate = useNavigate();
  const toast = useToast();

  React.useEffect(() => {
    if (!blockingChildUpdate) {
      getChildGoal()
    }
  }, []);

  React.useEffect(() => {
    if (!blockingChildUpdate) {
      get("selectedChild")
        .then(async (data) => {
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
        })
        .finally(() =>
          setIsLoading((prevState) => ({ ...prevState, child: false }))
        );
    }
  }, []);

  const getChildGoal = () => {
    get("childGoal").then(async (data) => {
      if (data) {
        setGoal({
          ...data,
          name: data.name,
          value: parseInt(data.value),
          hasGoal: data.hasGoal,
        });
        setIsLoading(false);
      }
    });
  }

  function getTransactions() {
    get("transactionList").then(async (val) => {
      setTransactions(val || []);
    });
  }

  React.useEffect(() => {
    getTransactions();
  }, []);

  React.useEffect(() => {
    if (child?.id) {
      getReward({});
    }
  }, [child?.id]);

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

    setChild((prevState) => ({
      ...prevState,
      balance: prevState.balance - goal.value,
    }));
    setBlockingChildUpdate(true);
    handleUnsetGoal();
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
          getReward({ rewardId: reward_id, revokeStateUpdate: true });
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
            await getChildren({ revokeStateUpdate: true });
            setIsLoading(false);
            setBlockingChildUpdate(false);
          });
        } else {
          console.error(returnedClaimReward.err);
          handleUpdateTransactions(
            transactions.filter(
              (transaction) => transaction.id !== new_transactions.id
            )
          );
          setBlockingChildUpdate(false);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const getChildren = async ({ revokeStateUpdate = false }) => {
    console.log(`balance child`, revokeStateUpdate);
    await get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([
        get(`balance-${data}`),
        get(`selectedChildName`),
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

  const getReward = ({ rewardId, revokeStateUpdate = false }) => {
    actor
      ?.getGoals(child?.id)
      .then(async (returnedRewards) => {
        if ("ok" in returnedRewards) {
          const rewards = Object.values(returnedRewards);
          let currentGoalId;
          if (!rewardId) {
            await actor?.getCurrentGoal(child?.id).then((returnedGoal) => {
              currentGoalId = parseInt(returnedGoal);

              return currentGoalId;
            });
          }

          if (rewards) {
            const reward = rewards?.[0]?.find(
              (reward) =>
                rewardId === parseInt(reward.id) ||
                currentGoalId === parseInt(reward.id)
            );

            if (reward) {
              const { name, value, id } = reward;
              const returnedGoal = {
                name,
                value: parseInt(value),
                hasGoal: true,
                id,
              };
              set("childGoal", returnedGoal);
              if (!revokeStateUpdate) {
                setGoal(returnedGoal);
              }
            }
          }
          const filteredRewards = rewards?.[0].map((reward) => {
            return {
              ...reward,
              value: parseInt(reward.value),
              id: parseInt(reward.id),
              active: currentGoalId === parseInt(reward.id) ? true : false,
            };
          });
          set("rewardList", filteredRewards);
        } else {
          set("childGoal", noGoalEntity);
          if (!revokeStateUpdate) {
            setGoal(noGoalEntity);
          }
          console.error(returnedRewards.err);
        }
      })
      .finally(() => setIsLoading(false));
  };
  const percentage = (
    (Number(child?.balance) / Number(goal?.value)) *
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
        className={`${styles.hero}`} //${props.isModalOpen}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          height={"100%"}
        >
          <Box display={"flex"} flexDirection={"column"} gap={0}>
            <Box className={styles.name}>{child?.name}</Box>
            {child?.balance >= 0 && (
              <Box className={styles.balance}>
                <img src={dc} className="dc-img-big" alt="DooCoins symbol" />
                {child?.balance}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              background: "transparent",
              zIndex: 999,
              minWidth: isAbleToClaim && "25%",
              minHeight: isAbleToClaim && { base: "70%", sm: "80%" },
              transform: isAbleToClaim && { base: `translateX(-4vw)` },
              cursor: isAbleToClaim && "pointer",
            }}
            onClick={handleGoalClick}
          >
            {goal?.hasGoal && !isAbleToClaim ? (
              <>
                <Box
                  display={"flex"}
                  className={styles.circular_progress}
                  flexDirection={"column"}
                  alignItems={"center"}
                  sx={{
                    width: { base: 100, sm: 200, md: 280 },
                    height: { base: 160, sm: 200, md: 280 },
                    maxHeight: "320px",
                  }}
                >
                  <CircularProgressbar
                    value={percentage}
                    // width= {"70%"}
                    text={`${percentage}%`}
                    background
                    backgroundPadding={6}
                    strokeWidth={5}
                    styles={buildStyles({
                      strokeLinecap: "butt",
                      // backgroundColor: "#0B334D",
                      backgroundColor: "transparent",
                      textColor: "#fff",
                      pathColor: "#00A4D7",
                      trailColor: "transparent",
                      textSize: "1.2em",
                    })}
                  />
                  <p
                    style={{
                      color: "#fff",
                      marginTop: "0px",
                      textAlign: "center",
                      fontSize: "1em",
                      lineHeight: "1em",
                    }}
                  >
                    {goal.name}
                  </p>
                </Box>
              </>
            ) : null}
            {goal?.hasGoal && isAbleToClaim && (
              <Box
                sx={{
                  color: "#fff",
                  marginTop: "0px",
                  textAlign: "center",
                  fontSize: "1em",
                  lineHeight: "1em",
                  position: "absolute",
                  bottom: { base: "-0%", sm: "-0%" },
                  transform: "translateX(-5%) translateY(6px)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "120%",
                }}
              >
                {goal.name}
              </Box>
            )}
          </Box>
        </Box>
      </header>
    </>
  );
};

export default React.memo(Balance);
