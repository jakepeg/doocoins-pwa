import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const AddActionDialog = ({
  handleClosePopup,
  handleSubmitForm,
  title,
  valuePlaceHolder,
  namePlaceHolder
}) => {
  const nameRef = React.useRef(null);
  const valueRef = React.useRef(null);
  return (
    <ConfirmationPopup handleClosePopup={handleClosePopup}>
      <h4 className={modelStyles.popup_title}>{title}</h4>
      <input
        type="text"
        name="task"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        ref={nameRef}
        defaultValue={nameRef.current ? nameRef.current.value : ""}
        placeholder={namePlaceHolder}
      />
      <input
        type="number"
        name="value"
        style={{ marginTop: "18px" }}
        className={`text-field ${modelStyles.popup_input_edit_field}`}
        ref={valueRef}
        defaultValue={valueRef.current ? valueRef.current.value : ""}
        placeholder={valuePlaceHolder}
      />
      <button
        className={modelStyles.popup_edit_action_btn}
        type="submit"
        onClick={() => handleSubmitForm(nameRef.current.value, valueRef.current.value)}
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

export default AddActionDialog;
