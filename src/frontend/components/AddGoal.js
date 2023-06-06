import * as React from "react";

const AddGoal = (props) => {

  return (
      <form onSubmit={props.handleAddGoal}>
        <label htmlFor="goal_name"> Title <input className="text" type="text" name="goal_name"/>
        </label>
        <label htmlFor="goal_value"> Value <input className="number" type="number" name="goal_value" />
        </label>
        <button className="button" type="submit">Add</button>
      </form>
  );
};

export default AddGoal;