class ConstantStrings {
  // App URL Path
  ABOUT_PATH = "/about";
  WALLET_PATH = "/wallet";
  TASKS_PATH = "/tasks";
  REWARDS_PATH = "/rewards";
}

const strings = new ConstantStrings();
export default strings;

export const noGoalEntity = {
  hasGoal: false,
  name: "no goal set",
  value: 0,
};
