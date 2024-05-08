class ConstantStrings {
  // App URL Path
  ABOUT_PATH = "/about";
  WALLET_PATH = "/wallet";
  ALERTS_PATH = "/alerts";
  TASKS_PATH = "/tasks";
  REWARDS_PATH = "/rewards";

  // CALLOUTS
  CALLOUTS_TASKS = "tasks"
  CALLOUTS_REWARDS = 'addRewards'
  CALLOUTS_CHILD_LIST = "childList"
  CALLOUT_NO_TRANSACTIONS = "transactions"
  CALLOUT_REWARDS_LIST = "rewards"
  CALLOUT_TASKS_LIST = "tasksList"
}

const strings = new ConstantStrings();
export default strings;

export const noGoalEntity = {
  hasGoal: false,
  name: "no goal set",
  value: 0,
};
