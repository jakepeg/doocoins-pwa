import { get } from "idb-keyval";
import React from "react";

const useCheckIsUserNewToChildList = ({ handleUpdateCalloutState }) => {
  const [isUserNewToChildList, setIsUserNewToChildList] = React.useState();
  const checkIsUserNewToChildList = async () => {
    const [childCallout, children] = await Promise.all([
      get("childListCallout"),
      get("childList"),
    ]);

    if (childCallout !== undefined && children !== undefined) {
      console.log("should be here");
      setIsUserNewToChildList(false);
      handleUpdateCalloutState("childList", false);
    } else {
      console.log("not here");
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
