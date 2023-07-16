import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const AddChildDialog = ({ handleClosePopup, handleSubmit }) => {
  const childRef = React.useRef(null);
  return (
    <ConfirmationPopup handleClosePopup={handleClosePopup}>
      <h4 className={modelStyles.popup_title}>Add a child</h4>
      <input
        type="text"
        name="child"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        ref={childRef}
        defaultValue={childRef.current ? childRef.current.value : ""}
        placeholder="name"
        autoFocus
      />
      <button
        className={modelStyles.popup_edit_action_btn}
        type="submit"
        onClick={() => handleSubmit(childRef.current.value)}
      >
        Add child
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

export default AddChildDialog;
