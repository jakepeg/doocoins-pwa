import { get } from "idb-keyval";
import React from "react";
import strings from "../utils/constants";

const useCheckIsUserNewToTransactions = ({ handleUpdateCalloutState }) => {
  const [isUserNew, setIsUserNew] = React.useState();
  const checkIsUserNewToTransactions = async () => {
    const [transactionTaskCallout, transactionList] = await Promise.all([
      get(`${strings.CALLOUT_NO_TRANSACTIONS}Callout`),
      get('transactionList')
    ]);

    if ((transactionTaskCallout === undefined || transactionTaskCallout === true) && !transactionList?.length) {
      setIsUserNew(true);
      handleUpdateCalloutState(strings.CALLOUT_NO_TRANSACTIONS, true);
    } else {
      setIsUserNew(false);
      handleUpdateCalloutState(strings.CALLOUT_NO_TRANSACTIONS, false);
    }
  };

  React.useEffect(() => {
    checkIsUserNewToTransactions();
  }, []);

  return { isUserNew };
};

export default useCheckIsUserNewToTransactions;
