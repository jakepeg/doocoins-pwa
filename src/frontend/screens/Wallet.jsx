import * as React from "react";
import { get, set } from "idb-keyval";
import Balance from "../components/Balance";
import LoadingSpinner from "../components/LoadingSpinner";
import dc from "../assets/images/dc.svg";
import { useAuth } from "../use-auth-client";
import { useNavigate } from "react-router-dom";
import { Box, Skeleton, Stack } from "@chakra-ui/react";
import { ChildContext } from "../contexts/ChildContext";

const Wallet = () => {
  const { actor } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = React.useState([]);
  const { child, setChild } = React.useContext(ChildContext);
  const [isLoading, setIsLoading] = React.useState({
    transactions: false,
    child: !child ? true : false,
  });

  React.useEffect(() => {
    if (child) {
      setIsLoading((prevState) => ({
        ...prevState,
        child: false,
      }));
    }
  }, [child]);

  const humanReadableDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  React.useEffect(() => {
    get("selectedChild")
      .then(async (data) => {
        const [balance, name] = await Promise.all([
          get(`balance-${data}`),
          get(`selectedChildName`),
        ]);
        if (data) {
          setChild({
            id: data,
            balance: parseInt(balance),
            name,
          });
        } else {
          navigate("/");
        }
      })
      .finally(() =>
        setIsLoading((prevState) => ({ ...prevState, child: false }))
      );
  }, []);

  function getTransactions({ callService = false }) {
    if (child) {
      get("transactionList").then(async (val) => {
        if (val == undefined || callService) {
          setIsLoading((prevState) => ({ ...prevState, transactions: true }));
          actor
            ?.getTransactions(child.id)
            .then((returnedTransactions) => {
              if ("ok" in returnedTransactions) {
                const transactions = Object.values(returnedTransactions);
                if (transactions.length) {
                  set("transactionList", transactions[0]);
                  setTransactions(transactions?.[0]);
                }
                setIsLoading((prevState) => ({ ...prevState, transactions: false }));
              } else {
                console.error(returnedTransactions.err);
                set("transactionList", undefined);
              }
            })
            .finally(() =>
              setIsLoading((prevState) => ({
                ...prevState,
                transactions: false,
              }))
            );
        } else {
          setTransactions(
            val?.map((transaction) => {
              return {
                ...transaction,
                id: parseInt(transaction.id),
                value: parseInt(transaction.value),
              };
            })
          );
          setIsLoading((prevState) => ({
            ...prevState,
            transactions: false,
          }));
        }
      });
      return false;
    }
  }

  React.useEffect(() => {
    if (child) getTransactions(child);
  }, [actor, child]);

  const sortTransactionsByDate = React.useCallback(() => {
    transactions.sort((a, b) => {
      const dateA = new Date(parseInt(a.completedDate) * 1000);
      const dateB = new Date(parseInt(b.completedDate) * 1000);
      return dateB - dateA;
    });

    return transactions;
  }, [transactions]);

  if (isLoading.child) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="light-panel transactions">
        <h2 className="title-button dark">
          <span>Transactions</span>
        </h2>
        {isLoading.transactions ? (
          <>
            <Stack gap={"20px"} margin={"0 0 20px 0"}>
              <Box display="flex" flexDirection={"column"} gap={1}>
                <Skeleton height="20px" width={"15%"} />
                <Skeleton height="20px" />
              </Box>
              <Box display="flex" flexDirection={"column"} gap={1}>
                <Skeleton height="20px" width={"15%"} />
                <Skeleton height="20px" />
              </Box>
              <Box display="flex" flexDirection={"column"} gap={1}>
                <Skeleton height="20px" width={"15%"} />
                <Skeleton height="20px" />
              </Box>
            </Stack>
          </>
        ) : (
          <>
            {transactions.length > 0 ? (
              <>
                {sortTransactionsByDate().map((transaction) => (
                  <div
                    className="list-item"
                    role="button"
                    key={parseInt(transaction.id)}
                  >
                    <div>
                      <span className="date">
                        {humanReadableDate(transaction.completedDate)}
                      </span>
                      {transaction.name}
                    </div>
                    <div>
                      {transaction.transactionType === `GOAL_DEBIT` ? (
                        <span>-</span>
                      ) : null}

                      <img
                        src={dc}
                        className="dc-img-small pushdown"
                        alt="DooCoins symbol"
                      />
                      {parseInt(transaction.value)}
                    </div>
                  </div>
                ))}
              </>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

export default Wallet;
