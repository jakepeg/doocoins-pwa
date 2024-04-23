import { get } from "idb-keyval";
import React from "react";
import strings from "../utils/constants";

const useCheckIsUserNewToChildList = ({ handleUpdateCalloutState }) => {
  const [isUserNewToChildList, setIsUserNewToChildList] = React.useState();
  const checkIsUserNewToChildList = async () => {
    const [childCallout, children] = await Promise.all([
      get(`${strings.CALLOUTS_CHILD_LIST}Callout`),
      get("childList"),
    ]);

    if (childCallout !== undefined && children !== undefined) {
      setIsUserNewToChildList(false);
      handleUpdateCalloutState("childList", false);
    } else {
      setIsUserNewToChildList(true);
      handleUpdateCalloutState("childList", true);
    }
  };

  React.useEffect(() => {
    checkIsUserNewToChildList();
  }, []);

  return { isUserNewToChildList };
};

export default useCheckIsUserNewToChildList;
