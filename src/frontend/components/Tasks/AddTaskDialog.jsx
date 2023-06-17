import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const AddTaskDialog = ({
  handleClosePopup,
  selectedChild,
  handleSubmitTask,
}) => {
  const taskRef = React.useRef(null);

  return (
    <ConfirmationPopup handleClosePopup={handleClosePopup}>
      <h4 className={modelStyles.popup_title}>Add Task</h4>
      <input
        type="text"
        name="child_name"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        defaultValue={selectedChild.name}
        readOnly
      />
      <input
        type="text"
        name="task"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        ref={taskRef}
        defaultValue={taskRef.current ? taskRef.current.value : ""}
        placeholder="Clean room table..."
      />
      <button
        className={modelStyles.popup_edit_action_btn}
        type="submit"
        onClick={() => handleSubmitTask(taskRef.current.value)}
      >
        Submit
      </button>
      <p
        role="button"
        className={modelStyles.popup_cancel_action_btn}
        onClick={handleClosePopup}
      >
        cancel
      </p>
    </ConfirmationPopup>
  );
};

export default AddTaskDialog;
