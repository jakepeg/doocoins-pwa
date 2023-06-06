import * as React from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const GoalProgress = (props) => {

  const [actor, setActor] = React.useState(null);
  const [goals, setGoals] = React.useState({});
  const [hasGoal, setHasGoal] = React.useState(false);
  const [goalValue, setGoalValue] = React.useState(null);
  const [goalName, setGoalName] = React.useState(null);
  const [goalId, setGoalId] = React.useState(null);

  function getGoals(child) {
    actor?.getGoals(child).then((returnedGoals) => {
      const goals = Object.values(returnedGoals);
      setGoals(goals);
    });
    // actor?.getGoals(child.then((returnedGoals) => {
    //   if ("ok" in returnedGoals) {
    //     const goals = Object.values(returnedGoals);
    //     setGoals(goals);
    //   } else {
    //     console.error(returnedGoals.err);
    //   }
    // }))
    return false;
  }

  function getCurrentGoal(child) {
    actor?.getCurrentGoal(child).then((returnedGoal) => {
      if(returnedGoal > 0) {
        let info = goals[0].filter(x => x.id === returnedGoal);
        setGoalName(info[0].name);
        setGoalValue(parseInt(info[0].value));
        setGoalId(info[0].id);
        setHasGoal(true);
      } else {
        setGoalName("no goal set");
        setGoalValue(0);
      }
    });
    // actor?.getCurrentGoal(child).then((returnedGoal) => {
    //   if ("ok" in returnedGoal) {
    //     if(returnedGoal > 0) {
    //       let info = goals[0].filter(x => x.id === returnedGoal);
    //       setGoalName(info[0].name);
    //       setGoalValue(parseInt(info[0].value));
    //       setGoalId(info[0].id);
    //       setHasGoal(true);
    //     } else {
    //       setGoalName("no goal set");
    //       setGoalValue(0);
    //     }
    //   } else {
    //     console.error(returnedGoal.err);
    //   }
    // });
    return false;
  }

  const initActor = () => {
    import("../declarations/doocoins")
    .then((module) => {
      const actor = module.createActor(module.canisterId, {
        agentOptions: {
          identity: props.authClient?.getIdentity(),
        },
      });
      setActor(actor);
    })
  };

  React.useEffect(() => {
    if (props.isAuthenticated) initActor();
  }, [props.selectedChild]);

  React.useEffect(() => {
    getGoals(props.selectedChild);
  }, [props.selectedChild, props.newGoal, props.currentGoal]);

  React.useEffect(() => {
    getCurrentGoal(props.selectedChild);
  }, [goals]);

  return (
    <div className="goal">
      <div className="goal-info">
        <p className="goal-name">{goalName}</p>
        {props.balance >= goalValue && goalValue > 0 &&
          <button className="claim" onClick={() => props.handleClaimGoal(parseInt(goalId))}>Claim</button>
        }
      </div>
      {hasGoal &&
      <div className="goal-progress">
        <CircularProgressbar 
          strokeWidth="12" 
          value={props.balance} 
          maxValue={goalValue} 
          text={`${props.balance}`} 
          styles={buildStyles({
            strokeLinecap: 'butt', // 'butt' or 'round'
            textSize: '1.5em',
            pathColor: `hsl(184, 81%, 37%)`,
            textColor: 'hsl(184, 81%, 37%)',
            trailColor: 'hsl(205, 67%, 96%)',
          })}

        />
        <p className="goal-value">of {goalValue}</p>
      </div>
      }
    </div>
  );
};

export default GoalProgress;