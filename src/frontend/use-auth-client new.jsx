// Import libraries
import { AuthClient } from "@dfinity/auth-client"; // Library for interacting with Dfinity authentication

// Import necessary functions from React
import React, { createContext, useContext, useEffect, useState } from "react";  

// Import canisterId and createActor (likely from a separate file)
import { canisterId, createActor } from "../declarations/backend";  

// Import optional local storage library (if used for clearing data on logout)
import { del } from "idb-keyval"; 

// Create an AuthContext using React.createContext
const AuthContext = createContext();

// Define default options for the AuthClient (commented out as it's not used in this version)
// These options control idle behavior and login parameters
const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  },
  loginOptions: {
    identityProvider: "https://nfid.one/authenticate/?applicationName=DooCoins&applicationLogo=https://nfid.one/icons/favicon-96x96.png#authorize", 
    maxTimeToLive: BigInt (30) * BigInt(24) * BigInt(3_600_000_000_000), // Sets login expiration to 30 days (commented out)
  },
};

// Custom hook to manage authentication state across the app
export const useAuthClient = (options = defaultOptions) => {

  // Define state variables to track authentication state and related information
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks if user is authenticated
  const [authClient, setAuthClient] = useState(null); // Stores the AuthClient instance
  const [identity, setIdentity] = useState(null); // Stores user identity information
  const [principal, setPrincipal] = useState(null); // Stores user principal derived from identity
  const [actor, setActor] = useState(null); // Stores the created actor object for interacting with the blockchain
  const [isLoading, setIsLoading] = useState(true); // Tracks loading state during initialization

  // useEffect hook to handle creating the AuthClient instance on component mount
  useEffect(() => {
    if (authClient == null) { // Check if AuthClient instance is not yet created
      setIsLoading(true); // Set loading state to true
      AuthClient.create().then(async (client) => {
        updateClient(client); // Call helper function to update state with client object
      }).finally(() => {
        setIsLoading(false); // Set loading state to false after potential async operations
      });
    }
  }, []); // Empty dependency array ensures the effect runs only once on component mount

  // Login function to initiate the authentication flow using the AuthClient
  const login = () => {
    authClient.login({
      ...options.loginOptions, // Spread default options with any custom options provided
      onSuccess: () => {
        updateClient(authClient); // Call helper function to update state on successful login
      },
    });
  };

  // Helper function to update state variables based on the provided AuthClient instance
  async function updateClient(client) {
    const isAuthenticated = await client.isAuthenticated(); // Check if user is authenticated
    setIsAuthenticated(isAuthenticated);
    const identity = client.getIdentity(); // Get user identity information
    setIdentity(identity);
    const principal = identity.getPrincipal(); // Extract user principal from identity
    setPrincipal(principal);
    setAuthClient(client); // Update client state

    // Create an actor object using the canisterId and user identity for interacting with the blockchain
    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
    setActor(actor);
  }
};

// Logout function to clear authentication state and potentially make calls to the backend
async function logout() {
  // Clear local storage items (optional)
  del("childList"); // Delete "childList" from local storage (optional)
  del("childGoal"); // Delete "childGoal" from local storage (optional)
  del("rewardList"); // Delete "rewardList" from local storage (optional)
  del("selectedChild"); // Delete "selectedChild" from local storage (optional)
  del("selectedChildName"); // Delete "selectedChildName" from local storage (optional)
  del("taskList"); // Delete "taskList" from local storage (optional)
  del("transactionList"); // Delete "transactionList" from local storage (optional)

  if (authClient) { // Check if AuthClient instance exists
    await authClient?.logout(); // Attempt to log out the user using the AuthClient (optional chaining)
    await updateClient(authClient); // Update state variables after logout using helper function
  }


// Return object containing functions and state variables for authentication management
return {
  isAuthenticated,
  login,
  logout,
  authClient,
  identity,
  principal,
  actor,
  isLoading
};
};

// Custom React component (AuthProvider) to provide authentication context to child components
export const AuthProvider = ({ children }) => {
  const auth = useAuthClient(); // Call useAuthClient hook to get authentication state and functions
  return (
    <AuthContext.Provider value={auth}>{children}</AuthContext.Provider> // Wrap child components with AuthContext.Provider, providing "auth" value
  );
};

// Custom hook (useAuth) to access authentication context from child components
export const useAuth = () => useContext(AuthContext);
