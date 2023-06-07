import * as React from "react";

const AddChild = (props) => {

  return (
      <form onSubmit={props.handleAddChild}>
        <div className="form">
          <label htmlFor="child_name">
            <input type="text" name="child_name" className="text-field" placeholder="name" />
          </label><br /><br />
        <button className="button" type="submit">add child</button>
      </div>
    </form>
  );
};

export default AddChild;