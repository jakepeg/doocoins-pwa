import * as React from "react";

const AddChild = (props) => {
  return (
    <form onSubmit={props.handleAddChild}>
      <div className="form">
        <input
          type="text"
          name="child_name"
          className="text-field"
          placeholder="name"
        />
        <br />
        <br />
        <button className="button" type="submit">
          add child
        </button>
      </div>
    </form>
  );
};

export default AddChild;