import * as React from "react";
import LoadingSpinner from "./LoadingSpinner";
import Moment from 'react-moment';
import dc from '../images/dc.svg';

const TransactionList = (props) => {
  const [actor, setActor] = React.useState(null);
  const [transactions, setTransactions] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  function getTransactions(child) {
    if (child) {
    console.log("getTransactions called for child id: "+child);
    setIsLoading(true);
    actor?.getTransactions(child).then((returnedTransactions) => {
      if ("ok" in returnedTransactions) {
        const transactions = Object.values(returnedTransactions);
        setTransactions(transactions);
        setIsLoading(false);
      } else {
        console.error(returnedTransactions.err);
      }
    });
    return false;
  }
}

  const initActor = () => {
    import("../declarations/doocoins")
    .then((module) => {
      const actor = module.createActor(module.canisterId, {
        agentOptions: {
          identity: props.authClient?.getIdentity(),
        },
      });
      setActor(actor);
    })
  };

  React.useEffect(() => {
    if (props.isAuthenticated) initActor();
  }, [props.isAuthenticated]);

  React.useEffect(() => {
    getTransactions(props.selectedChild);
  }, [props.selectedChild, props.balance]);

  return (
      <>
            {isLoading ? <LoadingSpinner /> : null}
            {transactions.length > 0 &&
              transactions[0].reverse().map(transaction => (
                  <div className={transaction.transactionType} key={parseInt(transaction.id)}>
                    <div className="col-medium"><p className="col-p"><Moment format="DD/MM/YY" unix>{transaction.completedDate}</Moment></p></div>
                    <div className="col-large"><p className="col-p">{transaction.name}</p></div>
                    <div className="col-small"><p className="col-p"><img src={dc} className="dc-img" alt="DooCoins symbol" />{parseInt(transaction.value)}</p></div>
                  </div> 
                ))
            }
      </>
  );
};

export default TransactionList;