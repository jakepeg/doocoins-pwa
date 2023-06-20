import React from "react";
import ConfirmationPopup from "../popup/ConfirmationPopup";
import modelStyles from "../../components/popup/confirmation_popup.module.css";

const ApproveDialog = ({ handleApprove, handleClosePopup, selectedItem, submitBtnLabel = "Approve" }) => {
  return (
    <ConfirmationPopup handleClosePopup={handleClosePopup}>
      <h4 className={modelStyles.popup_title}>{selectedItem.name}</h4>
      <button
        className={modelStyles.popup_edit_action_btn}
        onClick={handleApprove}
      >
        {submitBtnLabel}
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
