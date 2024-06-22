import * as React from "react";
import dc from "../assets/images/dc-thin-white.svg";
import GoalIcon from "../assets/images/card-header/cc-claim.svg";
import ReqClaimIcon from "../assets/images/card-header/req_claim.svg";
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
    blockingChildUpdate,
    setTransactions,
  } = React.useContext(ChildContext);
  const { actor, store } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const balance = child?.balance || 0;
  const navigate = useNavigate();
  const toast = useToast();

  React.useEffect(() => {
    if (!blockingChildUpdate) {
      getChildGoal()
    }
  }, []);

  const getChildGoal = () => {
    get("childGoal", store).then(async (data) => {
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
    get("transactionList", store).then(async (val) => {
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
    set("transactionList", transactions, store);
  };

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
              set("childGoal", returnedGoal, store);
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
          set("rewardList", filteredRewards, store);
        } else {
          set("childGoal", noGoalEntity, store);
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

  const handleReq = async (selectedReward) => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  };

  const handleGoalClick = () => {
    if (isAbleToClaim && !isLoading) {
      handleReq(goal);
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
              ? ReqClaimIcon
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
                    height: { base: 160, sm: 200, md: 250 },
                    maxHeight: "320px",
                  }}
                >
                  <CircularProgressbar
                    value={percentage}
                    // width= {"70%"}
                    text={`${percentage}%`}
                    background
                    backgroundPadding={6}
                    strokeWidth={4}
                    styles={buildStyles({
                      strokeLinecap: "butt",
                      backgroundColor: "#0B334D",
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
                      fontSize: "25px",
                      fontWeight: "300",
                      lineHeight: "1.5em",
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
