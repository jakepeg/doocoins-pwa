import React from "react";
import { useDisclosure } from "@chakra-ui/react";
import { ChildContext } from "../../contexts/ChildContext";
import strings from "../../utils/constants";
import AddItemToListCallout from "../Callouts/AddItemToListCallout";

const AddRewardCalloutWrapper = ({ addClicked, rewards, loader }) => {
  const { isNewToSystem, handleUpdateCalloutState, child } =
    React.useContext(ChildContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    if (isNewToSystem[strings.CALLOUTS_REWARDS]) {
      onOpen();
    }
  }, [isNewToSystem[strings.CALLOUTS_REWARDS]]);

  React.useEffect(() => {
    if (addClicked) {
      if (isOpen) {
        onClose();
        handleUpdateCalloutState([strings.CALLOUTS_REWARDS], false);
      }
    }
  }, [addClicked]);

  return (
    <>
      {isOpen && (
        <AddItemToListCallout
          TextDescription={
            <>
              Ready to set rewards for {child?.name}? <br />
              Tap the + icon to get started!
            </>
          }
          itemKey={strings.CALLOUTS_REWARDS}
          isOpen={isOpen && !loader.init && !rewards?.length}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default AddRewardCalloutWrapper;
