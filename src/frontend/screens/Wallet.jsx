import * as React from "react";
// import Moment from 'react-moment';
import { get } from "idb-keyval";
import Balance from "../components/Balance";
import Goal from "../components/Goal";
import LoadingSpinner from "../components/LoadingSpinner";
import dc from "../assets/images/dc.svg";
import { useAuth } from "../use-auth-client";

const Wallet = () => {
  const {actor} = useAuth()
  const [transactions, setTransactions] = React.useState({});
  const [currentGoal, setCurrentGoal] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [child, setChild] = React.useState(null);

  // const humanReadableDate = time => {
  //   return new Date(time).toLocaleString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //   });
  // };

  const humanReadableDate = timestamp => {
    const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  React.useEffect(() => {
    setIsLoading(true)
    get("selectedChild").then(async (data) => {
      const [balance, name] = await Promise.all([get(`balance-${data}`), get(`selectedChildName`)])
      setChild({
        id: data,
        balance: parseInt(balance),
        name
      });
    })
  }, [])

  function getTransactions() {
    if (child) {
    console.log("getTransactions called for child id: "+child.id);
    setIsLoading(true);
    actor?.getTransactions(child.id).then((returnedTransactions) => {
      if ("ok" in returnedTransactions) {
        const transactions = Object.values(returnedTransactions);
        setTransactions(transactions);
        setIsLoading(false);
        console.log("transactions: ", transactions);
      } else {
        console.error(returnedTransactions.err);
      }
    });
    return false;
  }
}

  React.useEffect(() => {
    if (child) getTransactions(child);
  }, [actor, child]);

  if(isLoading) {
    return  <LoadingSpinner />
  }

  return (
    <>
      <Balance childName={child.name} childBalance={child.balance} />
      <div className="light-panel transactions">
        <Goal />
        <h2 className="title-button dark"><span>Transactions</span></h2>
        {isLoading ? <LoadingSpinner /> : null}
        {transactions.length > 0 &&
              transactions[0].reverse().map(transaction => (
            <div
              className="list-item"
              role="button"
              key={parseInt(transaction.id)}
            >
              <div>
                <span className="date">{humanReadableDate(transaction.completedDate)}</span>
                {transaction.name}</div>
              <div>
              {transaction.transactionType === `GOAL_DEBIT` ? <span>-</span> : null}

                <img src={dc} className="dc-img-small pushdown" alt="DooCoins symbol" />
                {parseInt(transaction.value)}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Wallet;