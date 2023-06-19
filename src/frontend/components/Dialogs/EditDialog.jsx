import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const EditDialog = ({ handleCloseEditPopup, selectedChild }) => {
  const taskRef = React.useRef(null);
  const valueRef = React.useRef(null);
  console.log(`selectedChild`, selectedChild)
  return (
    <ConfirmationPopup handleClosePopup={handleCloseEditPopup}>
      <h4 className={modelStyles.popup_title}>Edit {selectedChild.name}</h4>
      <input
        type="text"
        name="task"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        ref={taskRef}
        defaultValue={selectedChild.name ? selectedChild.name : undefined}
        placeholder="Task Name"
      />
      <input
        type="number"
        name="value"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        ref={valueRef}
        defaultValue={selectedChild.value ? parseInt(selectedChild.value) : undefined}
        placeholder="Task Value"
      />
      <button
        className={modelStyles.popup_edit_action_btn}
        onClick={handleCloseEditPopup}
      >
        EDIT
      </button>
      <p
        className={modelStyles.popup_cancel_action_btn}
        onClick={handleCloseEditPopup}
      >
        Cancel
      </p>
    </ConfirmationPopup>
  );
};

export default EditDialog;
