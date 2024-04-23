import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const DeleteDialog = ({ handleCloseDeletePopup, selectedItem, handleDelete }) => {
  return (
    <ConfirmationPopup handleClosePopup={handleCloseDeletePopup}>
      <h4 className={modelStyles.popup_title}>Delete {selectedItem.name}</h4>
      <button
        className={modelStyles.popup_delete_action_btn}
        onClick={() => handleDelete(selectedItem.id, selectedItem.name)}
      >
        Delete
      </button>
      <p
        className={modelStyles.popup_cancel_action_btn}
        onClick={handleCloseDeletePopup}
      >
        Cancel
      </p>
    </ConfirmationPopup>
  );
};

export default DeleteDialog;
