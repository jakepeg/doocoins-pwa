import * as React from "react";
import { get, set } from "idb-keyval";
import { useAuth } from "../use-auth-client";
import { Skeleton, Stack, useDisclosure, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import strings, { noGoalEntity } from "../utils/constants";
import { ChildContext } from "../contexts/ChildContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ChildReward from "../components/Rewards/ChildReward";

const Rewards = () => {
  const { actor, store } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen } = useDisclosure();
  const {
    child,
    setChild,
    setGoal,
    isNewToSystem,
    blockingChildUpdate,
    setRewards,
    rewards,
  } = React.useContext(ChildContext);

  const [loader, setLoader] = React.useState({
    init: true,
    singles: false,
    child: !child ? true : false,
  });

  React.useEffect(() => {
    if (isNewToSystem[strings.CALLOUT_REWARDS_LIST]) {
      onOpen();
    }
  }, [isNewToSystem[strings.CALLOUT_REWARDS_LIST]]);

  React.useEffect(() => {
    if (!blockingChildUpdate) {
      getChildren({});
    }
  }, []);

  React.useEffect(() => {
    if (child) {
      setLoader((prevState) => ({
        ...prevState,
        child: false,
      }));
    }
  }, [child]);

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

  function getRewards({
    disableFullLoader,
    callService = false,
    revokeStateUpdate = false,
  }) {
    if (child.id) {
      if (!disableFullLoader) {
        setLoader((prevState) => ({ ...prevState, init: true }));
      }

      get("rewardList", store)
        .then(async (val) => {
          if (val === undefined || callService) {
            actor?.getGoals(child.id).then(async (returnedRewards) => {
              if ("ok" in returnedRewards) {
                const rewards = Object.values(returnedRewards);
                let currentGoalId;
                await actor?.getCurrentGoal(child.id).then((returnedGoal) => {
                  currentGoalId = parseInt(returnedGoal);

                  return currentGoalId;
                });
                const filteredRewards = rewards?.[0].map((reward) => {
                  return {
                    ...reward,
                    value: parseInt(reward.value),
                    id: parseInt(reward.id),
                    active: currentGoalId === parseInt(reward.id),
                  };
                });
                set("rewardList", filteredRewards, store);
                if (!revokeStateUpdate) {
                  setRewards(filteredRewards);
                }
                setLoader((prevState) => ({
                  ...prevState,
                  init: false,
                  singles: false,
                }));
              } else {
                console.error(returnedRewards.err);
              }
            });
          } else {
            if (!revokeStateUpdate) {
              setRewards(
                val?.map((reward) => {
                  return {
                    ...reward,
                    id: parseInt(reward.id),
                    value: parseInt(reward.value),
                  };
                })
              );
            }
            setLoader((prevState) => ({
              ...prevState,
              init: false,
              singles: false,
            }));
          }
        })
        .catch(() => {
          removeErrorItem();
        });

      return false;
    }
  }

  const removeErrorItem = () => {
    if (rewards?.length) {
      toast({
        title: "An error occurred.",
        description: `Apologies, please try again later.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      const finalRewards = rewards.filter((reward) => !reward?.isLocal);
      set("rewardList", finalRewards, store);
      setRewards(finalRewards);
    } else {
      set("rewardList", undefined, store);
      setRewards([]);
    }
  };

  function handleSetGoal({
    reward_id,
    isForSet,
    disableFullLoader,
    selectedReward,
  }) {
    if (isForSet) {
      // handleToggleGoalPopup();
      const returnedGoal = {
        hasGoal: true,
        value: parseInt(selectedReward.value),
        name: selectedReward.name,
        id: parseInt(selectedReward.id),
      };
      set("childGoal", returnedGoal, store);
      setGoal(returnedGoal);
      const finalRewards = rewards.map((reward) => {
        if (reward.id === reward_id) {
          return { ...reward, active: true };
        } else {
          return { ...reward, active: false };
        }
      });
      setRewards(finalRewards);
      set("rewardList", finalRewards, store);
    } else {
      set("childGoal", noGoalEntity, store);
      setGoal(noGoalEntity);
      // handleCloseRemoveGoalPopup();
      const finalRewards = rewards.map((reward) => {
        if (reward.id === selectedReward.id) {
          return { ...reward, active: false };
        } else {
          return reward;
        }
      });
      setRewards(finalRewards);
      set("rewardList", finalRewards, store);
    }
    // if (!disableFullLoader) {
    // setLoader((prevState) => ({ ...prevState, init: true }));
    // }
    // API call currentGoal
    actor
      ?.currentGoal(child.id, reward_id)
      .then(async (returnedCurrentGoal) => {
        if ("ok" in returnedCurrentGoal) {
          if (isForSet) {
            toast({
              title: `Good luck achieving your goal, ${child.name}.`,
              status: "success",
              duration: 4000,
              isClosable: true,
            });
          } else {
            toast({
              title: `Goal removed for ${child.name}.`,
              status: "success",
              duration: 4000,
              isClosable: true,
            });
          }
          getRewards({
            disableFullLoader: true,
            callService: true,
            revokeStateUpdate: true,
          });
          await getChildren({});
        } else {
          console.error(returnedCurrentGoal.err);
          const finalRewards = rewards.map((reward) => {
            if (reward.id === reward_id) {
              return { ...reward, active: isForSet ? false : isForSet };
            } else {
              return reward;
            }
          });
          setRewards(finalRewards);
          set("rewardList", finalRewards, store);
        }
      });
  }

  React.useEffect(() => {
    if (child) getRewards({ callService: false });
  }, [actor, child]);

  const handleReq = async (selectedReward) => {
    try {
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
    }
  };

  const RewardList = React.useMemo(() => {
    return (
      <>
        {rewards?.length ? (
          <div className="example">
            <ul className="list-wrapper">
              {rewards.map((reward) => (
                <React.Fragment key={reward.id}>
                  <ChildReward
                    handleRemove={(selectedReward) => {
                      handleSetGoal({
                        reward_id: 0,
                        isForSet: false,
                        disableFullLoader: false,
                        selectedReward,
                      });
                    }}
                    handleSetGoal={(selectedReward) => {
                      handleSetGoal({
                        reward_id: parseInt(selectedReward.id),
                        isForSet: true,
                        disableFullLoader: false,
                        selectedReward,
                      });
                    }}
                    reward={reward}
                    child={child}
                    handleReq={(reward) => {
                      handleReq(reward);
                    }}
                    key={reward.id}
                  />
                </React.Fragment>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  }, [rewards, isOpen]);

  if (loader.child) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`light-panel max-w-screen`}>
      <div className={`panel-header-wrapper`} style={{ position: "relative" }}>
        <h2 className="title-button dark">
          <span>Rewards</span>{" "}
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
  );
};

export default Rewards;
