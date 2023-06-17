import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const DeleteDialog = ({ handleCloseDeletePopup, selectedChild }) => {
  return (
    <ConfirmationPopup handleClosePopup={handleCloseDeletePopup}>
      <h4 className={modelStyles.popup_title}>Delete {selectedChild.name}</h4>
      <button
        className={modelStyles.popup_delete_action_btn}
        onClick={handleCloseDeletePopup}
      >
        DELETE
      </button>
      <p
        className={modelStyles.popup_cancel_action_btn}
        onClick={handleCloseDeletePopup}
      >
        cancel
      </p>
    </ConfirmationPopup>
  );
};

export default DeleteDialog;
