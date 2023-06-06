import * as React from "react";

const AddTask = (props) => {

  return (
      <form onSubmit={props.handleAddTask}>
        <label htmlFor="task_name"> Title <input className="text" type="text" name="task_name" />
        </label>
        <label htmlFor="task_value"> Value <input className="number" type="number" name="task_value" />
        </label>
        <button className="button" type="submit">Add</button>
      </form>
  );
};

export default AddTask;