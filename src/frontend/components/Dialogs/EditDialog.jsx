import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const EditDialog = ({
  handleCloseEditPopup,
  selectedChild,
  handleSubmitForm,
  hasValueField = true,
  namePlaceholder = "Task Name",
  valuePlaceholder = "Task Value"
}) => {
  const nameRef = React.useRef(null);
  const valueRef = React.useRef(null);
  console.log(`selectedChild`, selectedChild);
  return (
    <ConfirmationPopup handleClosePopup={handleCloseEditPopup}>
      <h4 className={modelStyles.popup_title}>Edit {selectedChild.name}</h4>
      <input
        type="text"
        name="task"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        ref={nameRef}
        defaultValue={selectedChild.name ? selectedChild.name : undefined}
        placeholder={namePlaceholder}
      />
      {hasValueField && (
        <input
          type="number"
          name="value"
          style={{ marginTop: "18px" }}
          className={`text-field ${modelStyles.popup_input_edit_field}`}
          ref={valueRef}
          defaultValue={
            selectedChild.value ? parseInt(selectedChild.value) : undefined
          }
          placeholder={valuePlaceholder}
        />
      )}

      <button
        className={modelStyles.popup_edit_action_btn}
        onClick={() => handleSubmitForm(selectedChild.id, nameRef.current.value)}
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
