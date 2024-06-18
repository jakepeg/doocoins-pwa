import React from "react";
import { useAuth } from "../use-auth-client";

const useHasRewards = (childId) => {
  const { actor } = useAuth();
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        actor.hasRewards(childId).then((data) => {
          console.log("data are", data);
          setCount(parseInt(data));
        });
      } catch (error) {
        setCount(0);
        console.error("Failed to fetch data:", error);
      }
    };

    // Call fetchData immediately when the component mounts
    fetchData();

    // Set up the interval to call fetchData every 1 minute
    const intervalId = setInterval(fetchData, 60000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return count;
};

export default useHasRewards;
