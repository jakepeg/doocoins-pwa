import * as React from "react";

const AddChild = (props) => {

  return (
      <form onSubmit={props.handleAddChild}>
        <div className="form">
          <label htmlFor="child_name">
            <input type="text" name="child_name" placeholder="Name" />
          </label>
        <button className="button" type="submit">Add</button>
      </div>
    </form>
  );
};

export default AddChild;