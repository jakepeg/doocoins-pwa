import React from "react";
import { useAuth } from "../use-auth-client";

const useHasRewards = (childId, revokeCalls = false) => {
  const { actor } = useAuth();
  const [prevCount, setPrevCount] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      if (revokeCalls || !childId) return;

      try {
        let _count = 0;
        await Promise.all([
          actor.hasRewards(childId).then((data) => {
            _count += _count + parseInt(data);
          }),
          actor.hasTasks(childId).then((data) => {
            _count = _count + parseInt(data);
          }),
        ]);

        setCount((prevState) => {
          setPrevCount(prevState);
          return _count;
        });
      } catch (error) {
        setCount(0);
        setPrevCount(0);
        console.error("Failed to fetch data:", error);
      }
    };

    // Call fetchData immediately when the component mounts
    fetchData();

    // Set up the interval to call fetchData every 1 minute
    const intervalId = setInterval(fetchData, 10000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return { count, prevCount, hasNewData: count !== prevCount };
};

export default useHasRewards;
