import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const ApproveDialog = ({ handleApprove, handleClosePopup, selectedItem }) => {
  return (
    <ConfirmationPopup handleClosePopup={handleClosePopup}>
      <h4 className={modelStyles.popup_title}>Approve {selectedItem.name}</h4>
      <button
        className={modelStyles.popup_delete_action_btn}
        onClick={handleApprove}
      >
        Approve
      </button>
      <p
        className={modelStyles.popup_cancel_action_btn}
        onClick={handleClosePopup}
      >
        Cancel
      </p>
    </ConfirmationPopup>
  );
};

export default ApproveDialog;
