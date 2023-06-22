import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const EditDialog = ({
  handleCloseEditPopup,
  selectedItem,
  handleSubmitForm,
  hasValueField = true,
  namePlaceholder = "Task Name",
  valuePlaceholder = "Task Value"
}) => {
  const nameRef = React.useRef(null);
  const valueRef = React.useRef(null);

  return (
    <ConfirmationPopup handleClosePopup={handleCloseEditPopup}>
      <h4 className={modelStyles.popup_title}>Edit {selectedItem.name}</h4>
      <input
        type="text"
        name="task"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        ref={nameRef}
        defaultValue={selectedItem.name ? selectedItem.name : undefined}
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
            selectedItem.value ? parseInt(selectedItem.value) : undefined
          }
          placeholder={valuePlaceholder}
        />
      )}

      <button
        className={modelStyles.popup_edit_action_btn}
        onClick={() => handleSubmitForm(selectedItem.id, nameRef.current?.value, valueRef.current?.value)}
      >
        Save
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
