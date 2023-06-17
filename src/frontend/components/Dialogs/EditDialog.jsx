import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const EditDialog = ({ handleCloseEditPopup, selectedChild }) => {
  return (
    <ConfirmationPopup handleClosePopup={handleCloseEditPopup}>
      <h4 className={modelStyles.popup_title}>Edit {selectedChild.name}</h4>
      <input
        type="text"
        name="child_name"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        value={selectedChild.name}
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
        cancel
      </p>
    </ConfirmationPopup>
  );
};

export default EditDialog;
