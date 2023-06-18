import * as React from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Goal = () => {

  // const [hasGoal, setHasGoal] = React.useState(false);
  // const [goalValue, setGoalValue] = React.useState(null);
  // const [goalName, setGoalName] = React.useState(null);
  // const [goalId, setGoalId] = React.useState(null);


// check if goal is in local storage before calling api


 // handleSetGoal(reward_id) on rewards list

  // function getCurrentGoal(child) {
  //   actor?.getCurrentGoal(child).then((returnedGoal) => {
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
  //   });
  //   return false;
  // }

  // function handleClaimGoal(goal_id) {
  //   let r = window.confirm("Are you sure?");
  //   if (r == true) {
  //     let dateNum = Math.floor(Date.now() / 1000);
  //     let date = dateNum.toString();
  //     // API call claimGoal
  //     actor?.claimGoal(selectedChild,goal_id,date).then((returnedClaimGoal) => {
  //       if ("ok" in returnedClaimGoal) {
  //         setGoalClaimed(parseInt(goal_id));
  //       } else {
  //         console.error(returnedClaimGoal.err);
  //       }
  //     });
  //   } else {
  //     console.log("You pressed cancel!");
  //   }
  // }

  // React.useEffect(() => {
  //   getCurrentGoal(props.selectedChild);
  // }, [goals]);

  return (

    <div className="goal">
      <div className="goal-info">
        <p className="goal-name">Quin's goal <br />New Beyblade</p>
          <button className="claim">Claim</button>
      </div>
      <div className="goal-progress">
        <CircularProgressbar 
          strokeWidth="12" 
          value="100" 
          maxValue="200" 
          text="100" 
          styles={buildStyles({
            strokeLinecap: 'butt', // 'butt' or 'round'
            textSize: '1.5em',
            pathColor: `hsl(184, 81%, 37%)`,
            textColor: 'hsl(184, 81%, 37%)',
            trailColor: 'hsl(205, 67%, 96%)',
          })}
        />
        <p className="goal-value">of 200</p>
      </div>
    </div>

    // <div className="goal">
    //   <div className="goal-info">
    //     <p className="goal-name">{goalName}</p>
    //     {props.balance >= goalValue && goalValue > 0 &&
    //       <button className="claim" onClick={() => props.handleClaimGoal(parseInt(goalId))}>Claim</button>
    //     }
    //   </div>
    //   {hasGoal &&
    //   <div className="goal-progress">
    //     <CircularProgressbar 
    //       strokeWidth="12" 
    //       value={props.balance} 
    //       maxValue={goalValue} 
    //       text={`${props.balance}`} 
    //       styles={buildStyles({
    //         strokeLinecap: 'butt', // 'butt' or 'round'
    //         textSize: '1.5em',
    //         pathColor: `hsl(184, 81%, 37%)`,
    //         textColor: 'hsl(184, 81%, 37%)',
    //         trailColor: 'hsl(205, 67%, 96%)',
    //       })}

    //     />
    //     <p className="goal-value">of {goalValue}</p>
    //   </div>
    //   }
    // </div>
  );
};

export default Goal;