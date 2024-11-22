import { Box, ScaleFade } from "@chakra-ui/react";
import React from "react";
import CalloutIcon from "../../assets/images/callout-bottom-middle.svg";
import { ChildContext } from "../../contexts/ChildContext";
import strings from "../../utils/constants";

const WrapperStyles = {
  position: "absolute",
  width: { base: "80vw", sm: "55vw", md: "35%", lg: "25%" },
  zIndex: 9999,
  left: "50%",
  bottom: { base: "-5%", sm: "-45%", md: "-40%" },
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  transform: "translateX(-50%) translateY(-40%)",
};

const TextStyles = {
  position: "absolute",
  width: "70%",
  left: "50%",
  transform: "translateX(-50%) translateY(-45%)",
};

const IconStyles = {
  width: "100%",
};

const BottomNavCallout = ({ isOpen, onClose }) => {
  const { child, handleUpdateCalloutState } = React.useContext(ChildContext);

  React.useEffect(() => {
    let timeout;
    if (isOpen) {
      timeout = setTimeout(() => {
        handleUpdateCalloutState([strings.CALLOUT_NO_TRANSACTIONS], false);
        onClose();
      }, 10000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isOpen]);

  return (
    <ScaleFade isOpen={isOpen} initialScale={0.9} in={isOpen}>
      <Box sx={WrapperStyles}>
        <img src={CalloutIcon} style={IconStyles} />
        <p style={TextStyles}>
          No transactions yet. <br /> Get busy and start earning, {child?.name}!
        </p>
      </Box>
    </ScaleFade>
  );
};

export default BottomNavCallout;
