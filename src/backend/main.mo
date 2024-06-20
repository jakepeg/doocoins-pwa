import Trie "mo:base/Trie";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Types "./Types";
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Fuzz "mo:fuzz";
import { setTimer; recurringTimer } = "mo:base/Timer";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Array "mo:base/Array";

actor {

  type TimerId = Nat;

  stable var anonIdNew : Text = "2vxsx-fae"; // Reject AnonymousIdentity

  stable var profiles : Types.Profile = Trie.empty();
  stable var childNumber : Nat = 1;
  //for keeping the child to tasks mapping
  stable var childToTasks : Types.TaskMap = Trie.empty();
  stable var childToTaskNumber : Trie.Trie<Text, Nat> = Trie.empty();

  //for keeping the child to transactions mapping
  stable var childToTransactions : Types.TransactionMap = Trie.empty();
  stable var childToTransactionNumber : Trie.Trie<Text, Nat> = Trie.empty();

  //for keeping the child to goals mapping
  stable var childToGoals : Types.GoalMap = Trie.empty();
  stable var childToGoalNumber : Trie.Trie<Text, Nat> = Trie.empty();

  //for setting up child's current goal
  stable var childToCurrentGoal : Trie.Trie<Text, Nat> = Trie.empty();

  // MILESTONE #1
  //for mapping child's doocoins balance to child
  stable var childToBalance : Trie.Trie<Text, Nat> = Trie.empty();

  // MILESTONE #1
  //for magicCode child app onboarding OTP
  stable var childPins : Trie.Trie<Text, Nat> = Trie.empty();
  stable var childIdsFromPin : Trie.Trie<Nat, Text> = Trie.empty();

  //for child to request task complete and request claim reward
  stable var childRequestsTasks : Trie.Trie<Text, Types.TaskReqMap> = Trie.empty();
  stable var childRequestsRewards : Trie.Trie<Text, Types.RewardReqMap> = Trie.empty();

  //who am I
  //----------------------------------------------------------------------------------------------------

  public shared query (msg) func whoami() : async Principal {
    msg.caller;
  };

  // MILESTONE #1 METHODS
  //magicCode child app onboarding OTP
  // This section contains functions related to managing one-time passwords (OTPs)
  // used for onboarding child apps within the magicCode system.
  //----------------------------------------------------------------------------------------------------

  // burnCode function initiates the burning process for a provided OTP (pin).
  // Burning essentially removes the pin from the system after a specific time.
  public shared (msg) func burnCode<system>(pin : Nat) : async Nat {
    Debug.print "in burn function!";
    let now = Time.now();
    let oneMinute = 1_000_000_000 * 60 * 1;

    // Find the child app ID associated with the provided pin using a Trie data structure
    let childId = Trie.find(
      childIdsFromPin,
      keyNat(pin),
      Nat.equal,
    );
    Debug.print "before setting timers after childID!";

    // Define an async function to perform the actual burning process
    func burnCodeAsync() : async () {
      Debug.print "Starting the burn function!";
      // Print debug information about the pin and child ID (Often used with `debug_show` to convert values to Text)
      Debug.print(debug_show (pin) # "     " #debug_show (childId));
      // Remove the pin and child ID association from their respective Trie structures
      let (newChildPins, oldPin) = Trie.remove(childPins, keyText(nullToText(childId)), Text.equal);
      let (newChildIdsFromPin, oldIds) = Trie.remove(childIdsFromPin, keyNat(pin), Nat.equal);
      // Update the in-memory state of the Trie structures
      childPins := newChildPins;
      childIdsFromPin := newChildIdsFromPin;
    };
    // Schedule a timer to call the burnCodeAsync function after the timeout duration
    Debug.print("Setting timers!" #debug_show (Int.abs(now - oneMinute)));
    ignore setTimer<system>(
      #seconds(60 * 60), // 60 mins
      func() : async () {

        await burnCodeAsync();
      },
    );
    // Return the provided pin (possibly for reference)
    return pin;
  };
  // _randomPin function generates a random 4-digit integer to be used as an OTP.
  func _randomPin() : async Nat {
    let fuzz = Fuzz.Fuzz();
    let randInt16 = fuzz.nat.randomRange(1111, 9999);
    return randInt16;
  };
  // checkMagiCode function checks if a provided OTP (pin) exists in the system and returns the associated child app ID if found.
  public shared (msg) func checkMagiCode(pin : Nat) : async ?Text {
    Debug.print("checking at the magic code");
    // Find the child app ID associated with the provided pin using a Trie data structure
    let childId = Trie.find(
      childIdsFromPin,
      keyNat(pin),
      Nat.equal,
    );
    // If the pin is found, return the child ID
    if (childId != null) {
      return childId;
    };
    // If the pin is not found, return null
    return ?"";
  };

  // magicCode function creates a new OTP (pin) and associates it with a provided child app ID.
  // It also initiates the burning process for the pin after a specific time.
  public shared (msg) func magicCode(childId : Text) : async ?Nat {
    // Check if a pin already exists for the provided child ID
    let pinExists = Trie.find(
      childPins,
      keyText(childId),
      Text.equal,
    );
    // If a pin already exists, return it (no need to create a new one)
    if (pinExists != null) {
      return pinExists;
    };
    // If no pin exists, generate a new random 4-digit integer
    let pin : Nat = await _randomPin();
    // Add the association between the child ID and the new pin to the childPins Trie
    let (newChildPins, oldPins) = Trie.put(
      childPins,
      keyText(childId),
      Text.equal,
      pin,
    );
    childPins := newChildPins;
    // Retrieve the newly added pin from the childPins Trie for verification
    let childPinStore = Trie.find(
      childPins,
      keyText(childId),
      Text.equal,
    );
    // Add the association between the new pin and the child ID to the childIdsFromPin Trie
    let (childPinToId, childPinToOld) = Trie.put(
      childIdsFromPin,
      keyNat(pin),
      Nat.equal,
      childId,
    );
    // Update the childIdsFromPin Trie
    childIdsFromPin := childPinToId;
    // Initiate the burning process for the newly created pin with a timeout
    let burnt = await burnCode(nullToNat(childPinStore));
    // Return the newly created pin
    return childPinStore;
  };

  // END MILESTONE #1 TASKS

  //count users
  //----------------------------------------------------------------------------------------------------

  public shared query func numberOfProfiles() : async Nat {
    return childNumber;
  };

  //creating a new child record
  //----------------------------------------------------------------------------------------------------

  public shared (msg) func addChild(child : Types.ChildCall) : async Result.Result<Types.Child, Types.Error> {
    let callerId = msg.caller;

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    let childId = Principal.toText(callerId) # "-" # Nat.toText(childNumber);
    childNumber += 1;
    let finalChild : Types.Child = {
      name = child.name;
      id = childId;
      archived = false;
    };

    //Initializing task number to this child
    let (newChildToTaskNumber, existingTask) = Trie.put(
      childToTaskNumber,
      keyText(childId),
      Text.equal,
      1,
    );
    childToTaskNumber := newChildToTaskNumber;

    let (childtobalancemap, existing) = Trie.put(
      childToBalance,
      keyText(childId),
      Text.equal,
      0,
    );
    childToBalance := childtobalancemap;

    //Initializing goal (reward) number to this child
    let (newChildToGoalNumber, existingGoal) = Trie.put(
      childToGoalNumber,
      keyText(childId),
      Text.equal,
      1,
    );
    childToGoalNumber := newChildToGoalNumber;

    //Initializing transaction number to this child
    let (newChildToTransactionNumber, existingTransaction) = Trie.put(
      childToTransactionNumber,
      keyText(childId),
      Text.equal,
      1,
    );
    childToTransactionNumber := newChildToTransactionNumber;

    let newProfiles = Trie.put2D(
      profiles,
      keyPrincipal(callerId),
      Principal.equal,
      keyText(childId),
      Text.equal,
      finalChild,
    );
    profiles := newProfiles;
    return #ok(finalChild);
  };

  //Add a task
  //Parametes needed: childId and Task (name and value)
  //----------------------------------------------------------------------------------------------------

  public shared (msg) func addTask(task : Types.TaskCall, childId : Text) : async Result.Result<[Types.Task], Types.Error> {
    let callerId = msg.caller;

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    //Getting pointer of current task number of the child
    let currentTaskNumberPointer = Trie.find(
      childToTaskNumber,
      keyText(childId),
      Text.equal,
    );

    let finalPointer : Nat = if (task.id >= 0) { task.id } else {
      Option.get(currentTaskNumberPointer, 0);
    };
    let taskFinal : Types.Task = {
      name = task.name;
      value = task.value;
      id = finalPointer;
      archived = false;
    };
    switch (finalPointer) {
      case 0 {
        #err(#NotFound);
      };
      case (v) {
        let (newMap, existing) = Trie.put(
          childToTaskNumber,
          keyText(childId),
          Text.equal,
          finalPointer +1,
        );

        childToTaskNumber := newMap;

        let newChildToTasks = Trie.put2D(
          childToTasks,
          keyText(childId),
          Text.equal,
          keyNat(finalPointer),
          Nat.equal,
          taskFinal,
        );

        childToTasks := newChildToTasks;

        let myChildTasks = Trie.find(
          childToTasks,
          keyText(childId),
          Text.equal,
        );
        let myChildTasksFormatted = Option.get(myChildTasks, Trie.empty());
        return #ok(Trie.toArray(myChildTasksFormatted, extractTasks));
      };
    };
  };

  // Get all the children
  //----------------------------------------------------------------------------------------------------

  public shared (msg) func getChildren() : async Result.Result<[Types.Child], Types.Error> {
    let callerId = msg.caller;
    let unArchivedChilds : Buffer.Buffer<Types.Child> = Buffer.Buffer<Types.Child>(0);

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    let allChildren = Trie.find(
      profiles,
      keyPrincipal(callerId),
      Principal.equal,
    );
    let allChildrenFormatted = Option.get(allChildren, Trie.empty());
    let agnosticArchivedChildList = Trie.toArray(allChildrenFormatted, extractChildren);

    for (child in agnosticArchivedChildList.vals()) {
      if (child.archived == false) {
        unArchivedChilds.add(child);
      };
    };

    return #ok(Buffer.toArray(unArchivedChilds));
  };

  //Get the childs tasks
  //Parametes needed: childId
  //----------------------------------------------------------------------------------------------------

  public shared (msg) func getTasks(childId : Text) : async Result.Result<[Types.Task], Types.Error> {
    let unArchivedChildsTasks : Buffer.Buffer<Types.Task> = Buffer.Buffer<Types.Task>(0);

    let myChildTasks = Trie.find(
      childToTasks,
      keyText(childId),
      Text.equal,
    );
    let myChildTasksFormatted = Option.get(myChildTasks, Trie.empty());
    let agnosticArchivedChildTaskList = Trie.toArray(myChildTasksFormatted, extractTasks);

    for (task in agnosticArchivedChildTaskList.vals()) {
      if (task.archived == false) {
        unArchivedChildsTasks.add(task);
      };
    };
    return #ok(Buffer.toArray(unArchivedChildsTasks));
  };

  //Add goal
  //Parametes needed: childId and Goal
  //----------------------------------------------------------------------------------------------------

  public shared (msg) func addGoal(goal : Types.GoalCall, childId : Text) : async Result.Result<[Types.Goal], Types.Error> {
    let callerId = msg.caller;

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    //Getting pointer of current task number of the child
    let currentGoalNumberPointer = Trie.find(
      childToGoalNumber,
      keyText(childId),
      Text.equal,
    );

    let finalPointer : Nat = Option.get(currentGoalNumberPointer, 0);

    let finalGoalObject : Types.Goal = {
      name = goal.name;
      value = goal.value;
      id = finalPointer;
      archived = false;
    };

    switch (finalPointer) {
      case 0 {
        #err(#NotFound);
      };
      case (v) {
        let (newMap, existing) = Trie.put(
          childToGoalNumber,
          keyText(childId),
          Text.equal,
          finalPointer +1,
        );

        childToGoalNumber := newMap;

        let newChildToGoals = Trie.put2D(
          childToGoals,
          keyText(childId),
          Text.equal,
          keyNat(finalPointer),
          Nat.equal,
          finalGoalObject,
        );

        childToGoals := newChildToGoals;
        let myChildGoals = Trie.find(
          childToGoals,
          keyText(childId),
          Text.equal,
        );
        let myChildGoalsFormatted = Option.get(myChildGoals, Trie.empty());
        return #ok(Trie.toArray(myChildGoalsFormatted, extractGoals));
      };
    };
  };

  //Set the childs current goal
  //Parametes needed: childId and goalId
  //----------------------------------------------------------------------------------------------------

  public shared (msg) func currentGoal(childId : Text, goalId : Nat) : async Result.Result<(), Types.Error> {
    let (updateChildToGoalNumber, existing) = Trie.put(
      childToCurrentGoal,
      keyText(childId),
      Text.equal,
      goalId,
    );
    childToCurrentGoal := updateChildToGoalNumber;
    return #ok(());
  };

  //Get childs transactions
  //
  //----------------------------------------------------------------------------------------------------

  public func getTransactions(childId : Text) : async Result.Result<[Types.Transaction], Types.Error> {
    let myChildTransactions = Trie.find(
      childToTransactions,
      keyText(childId),
      Text.equal,
    );
    let myChildTransactionsFormatted = Option.get(myChildTransactions, Trie.empty());
    return #ok(Trie.toArray(myChildTransactionsFormatted, extractTransactions));
  };

  //Get childs goals (rewards)
  //
  //----------------------------------------------------------------------------------------------------

  public func getGoals(childId : Text) : async Result.Result<[Types.Goal], Types.Error> {
    let unArchivedGoals : Buffer.Buffer<Types.Goal> = Buffer.Buffer<Types.Goal>(0);
    let myChildGoals = Trie.find(
      childToGoals,
      keyText(childId),
      Text.equal,
    );
    let myChildGoalsFormatted = Option.get(myChildGoals, Trie.empty());
    let agnosticArchivedGoalList = Trie.toArray(myChildGoalsFormatted, extractGoals);
    for (goal in agnosticArchivedGoalList.vals()) {
      if (goal.archived == false) {
        unArchivedGoals.add(goal);
      };
    };
    return #ok(Buffer.toArray(unArchivedGoals));
  };

  //Approve a childs task
  //Parametes needed: childId and taskId
  //----------------------------------------------------------------------------------------------------

  public shared (msg) func approveTask(childId : Text, taskId : Nat, completedDate : Text) : async Result.Result<(), Types.Error> {
    let callerId = msg.caller;

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    let myChildTasks = Trie.find(
      childToTasks,
      keyText(childId),
      Text.equal,
    );

    let myChildTasksFormatted : Trie.Trie<Nat, Types.Task> = Option.get(myChildTasks, Trie.empty());

    let targetTask = Trie.find(
      myChildTasksFormatted,
      keyNat(taskId),
      Nat.equal,
    );
    switch (targetTask) {
      case null {
        #err(#NotFound);
      };
      case (?v) {
        let value : Nat = v.value;

        let (allTransactions, currentPointer) = returnTransactionDetails(childId);
        let transactionObject : Types.Transaction = {
          name = v.name;
          value = value;
          completedDate = completedDate;
          transactionType = "TASK_CREDIT";
          id = currentPointer;
        };
        let newChildToTransactionMap = Trie.put2D(
          childToTransactions,
          keyText(childId),
          Text.equal,
          keyNat(currentPointer),
          Nat.equal,
          transactionObject,
        );
        childToTransactions := newChildToTransactionMap;
        let myBalance = await getBalance(childId);
        let currentBalanceFormatted = Nat.add(myBalance, value);
        let (updatedBalanceMap, existing) = Trie.put(
          childToBalance,
          keyText(childId),
          Text.equal,
          currentBalanceFormatted,
        );
        childToBalance := updatedBalanceMap;
        #ok(());
      };
    };

  };

  //Claim childs goal (reward)
  //Parametes needed: childId and goalId
  //----------------------------------------------------------------------------------------------------
  public shared (msg) func claimGoal(childId : Text, goalId : Nat, completedDate : Text) : async Result.Result<(), Types.Error> {
    let callerId = msg.caller;

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    let myGoals : ?Trie.Trie<Nat, Types.Goal> = Trie.find(
      childToGoals,
      keyText(childId),
      Text.equal,
    );

    let myChildGoalsFormatted : Trie.Trie<Nat, Types.Goal> = Option.get(myGoals, Trie.empty());

    let targetGoal = Trie.find(
      myChildGoalsFormatted,
      keyNat(goalId),
      Nat.equal,
    );
    switch (targetGoal) {
      case null {
        #err(#NotFound);
      };
      case (?v) {
        let value : Nat = v.value;
        let myBalance = await getBalance(childId);
        if (value > myBalance) {
          return #err(#BalanceNotEnough);
        };
        let (allTransactions, currentPointer) = returnTransactionDetails(childId);
        let transactionObject : Types.Transaction = {
          name = v.name;
          value = value;
          completedDate = completedDate;
          transactionType = "GOAL_DEBIT";
          id = currentPointer;
        };

        let newChildToTransactionMap = Trie.put2D(
          childToTransactions,
          keyText(childId),
          Text.equal,
          keyNat(currentPointer),
          Nat.equal,
          transactionObject,
        );
        childToTransactions := newChildToTransactionMap;

        let currentBalanceFormatted = Nat.sub(myBalance, value);
        let (updatedBalanceMap, existing) = Trie.put(
          childToBalance,
          keyText(childId),
          Text.equal,
          currentBalanceFormatted,
        );
        childToBalance := updatedBalanceMap;
        #ok(());
      };
    };
  };

  //Get childs current goal
  //Parametes needed: childId
  //----------------------------------------------------------------------------------------------------
  public func getCurrentGoal(childId : Text) : async Nat {
    let currentGoalNumber = Trie.find(
      childToCurrentGoal,
      keyText(childId),
      Text.equal,
    );
    let currentGoalNumberFormatted = Option.get(currentGoalNumber, 0);
    return currentGoalNumberFormatted;
  };

  //Update childs task
  //Parametes needed: childId, taskNumber and updated task object
  //----------------------------------------------------------------------------------------------------
  public shared (msg) func updateTask(childId : Text, taskNumber : Nat, updatedTask : Types.Task) : async Result.Result<(), Types.Error> {

    let callerId = msg.caller;

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    let updatedChildToTasks = Trie.put2D(
      childToTasks,
      keyText(childId),
      Text.equal,
      keyNat(taskNumber),
      Nat.equal,
      updatedTask,
    );
    childToTasks := updatedChildToTasks;
    return #ok(());
  };

  //Update child
  //Parametes needed: childId and updated child object.
  //----------------------------------------------------------------------------------------------------
  public shared (msg) func updateChild(childId : Text, child : Types.Child) : async Result.Result<(), Types.Error> {
    let callerId = msg.caller;

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    let profilesUpdate = Trie.put2D(
      profiles,
      keyPrincipal(callerId),
      Principal.equal,
      keyText(childId),
      Text.equal,
      child,
    );
    profiles := profilesUpdate;
    return #ok(());
  };

  public shared (msg) func updateGoal(childId : Text, goalId : Nat, updatedGoal : Types.Goal) : async Result.Result<(), Types.Error> {

    let callerId = msg.caller;

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

    let updatedChildToGoals = Trie.put2D(
      childToGoals,
      keyText(childId),
      Text.equal,
      keyNat(goalId),
      Nat.equal,
      updatedGoal,
    );
    childToGoals := updatedChildToGoals;
    return #ok(());
  };

  private func keyPrincipal(x : Principal) : Trie.Key<Principal> {
    return { key = x; hash = Principal.hash(x) };
  };

  private func keyText(x : Text) : Trie.Key<Text> {
    return { key = x; hash = Text.hash(x) };
  };
  private func keyTextNull(x : Text) : Trie.Key<Text> {
    return { key = x; hash = Text.hash(x) };
  };

  private func keyNat(x : Nat) : Trie.Key<Nat> {
    return { key = x; hash = Hash.hash(x) };
  };

  private func extractChildren(k : Text, v : Types.Child) : Types.Child {
    return v;
  };

  private func extractTasks(k : Nat, v : Types.Task) : Types.Task {
    return v;
  };
  private func extractTasksReq(k : Text, v : Types.TaskRequest) : Types.TaskRequest {
    return v;
  };

  private func extractReReq(k : Text, v : Types.RewardRequest) : Types.RewardRequest {
    return v;
  };
  private func extractTransactions(k : Nat, v : Types.Transaction) : Types.Transaction {
    return v;
  };
  private func extractGoals(k : Nat, v : Types.Goal) : Types.Goal {
    return v;
  };

  private func nullToText(msg : ?Text) : Text {
    switch (msg) {
      case (?string) {
        return string;
      };
      case (null) {
        return "";
      };
    };
  };

  private func nullToNat(msg : ?Nat) : Nat {
    switch (msg) {
      case (?string) {
        return string;
      };
      case (null) {
        return 0;
      };
    };
  };

  private func returnTransactionDetails(childId : Text) : (Trie.Trie<Nat, Types.Transaction>, Nat) {
    let myTransactions : ?Trie.Trie<Nat, Types.Transaction> = Trie.find(
      childToTransactions,
      keyText(childId),
      Text.equal,
    );

    let myTransactionsFormatted : Trie.Trie<Nat, Types.Transaction> = Option.get(myTransactions, Trie.empty());
    var currentPointer : Nat = Trie.size(myTransactionsFormatted);
    currentPointer += 1;
    return (myTransactionsFormatted, currentPointer);
  };

  public func getBalance(childId : Text) : async Nat {
    let currentBalance = Trie.find(
      childToBalance,
      keyText(childId),
      Text.equal,
    );
    let currentBalanceFormatted = Option.get(currentBalance, 0);
    return currentBalanceFormatted;
  };

  // MILESTONE #2
  //Request rewards and task complete

  // This section contains functions related to managing task and reward requests
  // submitted by child apps.

  // **public shared (msg) func requestTaskComplete(childId : Text, taskId : Nat, name : Text, value : Nat) : async Text**
  // This function allows a child app to submit a request indicating that a task has been completed.
  // It creates a new "TaskRequest" object with details about the child, task, and reward value.
  // The request ID is a combination of child ID, task ID, and a random pin.
  // The function then stores the request in a Trie data structure identified by the child ID.
  // It returns the request ID as a reference.

  public shared (msg) func requestTaskComplete(childId : Text, taskId : Nat, name : Text, value : Nat) : async Text {
    // Generate a random 4-digit pin
    let randomPin = await _randomPin();
    // Construct the request ID by combining child ID, task ID, and random pin
    let requestId = childId # "-" #Nat.toText(taskId) #Nat.toText(randomPin);
    // Create a new "TaskRequest" object with details about the request
    let task : Types.TaskRequest = {
      childId;
      taskId;
      id = requestId;
      name = name;
      value = value;
    };
    // Find the existing task requests for the child (initially empty Trie)
    let allChildTasks = Trie.find(
      childRequestsTasks,
      keyText(childId),
      Text.equal,
    );
    // Get the existing task requests as an Option type (may be null)
    let allChildrenTaskormatted = Option.get(allChildTasks, Trie.empty());
    // Add the new task request to the child's existing requests (or create a new map if none exist)
    let (allChildTasksLV2, oldLV2) = Trie.put(
      allChildrenTaskormatted,
      keyText(requestId),
      Text.equal,
      task,
    );
    // Update the child's task requests in the main Trie data structure
    let (allChildTasksUpdate, oldLV1) = Trie.put(
      childRequestsTasks,
      keyText(childId),
      Text.equal,
      allChildTasksLV2,
    );
    // Update the in-memory state of the childRequestsTasks Trie
    childRequestsTasks := allChildTasksUpdate;
    // Return the generated request ID
    return requestId;

  };

  // requestClaimReward function is similar to requestTaskComplete, but for claiming rewards.
  // It creates a "RewardRequest" object and stores it in the childRequestsRewards Trie.
  public shared (msg) func requestClaimReward(childId : Text, rewardId : Nat, value : Nat, name : Text) : async Text {
    let randomPin = await _randomPin();
    let requestId = childId # "-" #Nat.toText(rewardId) #Nat.toText(randomPin);
    let task : Types.RewardRequest = {
      childId;
      reward = rewardId;
      id = requestId;
      value = value;
      name = name;
    };

    let allChildRewards = Trie.find(
      childRequestsRewards,
      keyText(childId),
      Text.equal,
    );

    let allChildrenRewardsFormatted = Option.get(allChildRewards, Trie.empty());

    let (allChildRewardssLV2, oldLV2) = Trie.put(
      allChildrenRewardsFormatted,
      keyText(requestId),
      Text.equal,
      task,
    );

    let (allChildRewardsUpdate, oldLV1) = Trie.put(
      childRequestsRewards,
      keyText(childId),
      Text.equal,
      allChildRewardssLV2,
    );

    childRequestsRewards := allChildRewardsUpdate;

    return requestId;

  };

  // getRewardReqs function retrieves all reward requests associated with a given child ID.
  // It uses Trie operations to find the child's requests, converts them to a list of "RewardRequest" objects,
  // and returns the list.
  public shared (msg) func getRewardReqs(childId : Text) : async [Types.RewardRequest] {
    // Create an empty buffer to store the reward requests
    let rewardsRequestBuffer : Buffer.Buffer<Types.RewardRequest> = Buffer.Buffer<Types.RewardRequest>(0);
    // Find the child's reward requests in the Trie
    let allChildRewards = Trie.find(
      childRequestsRewards,
      keyText(childId),
      Text.equal,
    );
    // Get the child's requests as an Option type (may be null)
    let allChildrenRewardsFormatted = Option.get(allChildRewards, Trie.empty());
    // Convert the child's requests (potentially empty Trie) to a list of "RewardRequest" objects
    let agnosticArchivedRewardslist = Trie.toArray(allChildrenRewardsFormatted, extractReReq);
    // Iterate through the list of requests and add them to the buffer
    for (reward in agnosticArchivedRewardslist.vals()) {
      rewardsRequestBuffer.add(reward);
    };
    // Convert the buffer containing requests to a Motoko array and return it
    return Buffer.toArray(rewardsRequestBuffer);
  };

  // hasRewards function checks if a child has any reward requests.
  // It follows a similar approach to getRewardReqs, but instead of returning the list,
  // it returns the number of requests found (buffer size).
  public shared (msg) func hasRewards(childId : Text) : async Nat {
    let rewardsRequestBuffer : Buffer.Buffer<Types.RewardRequest> = Buffer.Buffer<Types.RewardRequest>(0);

    let allChildRewards = Trie.find(
      childRequestsRewards,
      keyText(childId),
      Text.equal,
    );

    let allChildrenRewardsFormatted = Option.get(allChildRewards, Trie.empty());

    let agnosticArchivedRewardslist = Trie.toArray(allChildrenRewardsFormatted, extractReReq);

    for (reward in agnosticArchivedRewardslist.vals()) {
      rewardsRequestBuffer.add(reward);
    };

    return rewardsRequestBuffer.size();
  };

  // hasTasks function is similar to hasRewards but for task requests.
  public shared (msg) func hasTasks(childId : Text) : async Nat {
    let tasksRequestBuffer : Buffer.Buffer<Types.TaskRequest> = Buffer.Buffer<Types.TaskRequest>(0);

    let allChildTasks = Trie.find(
      childRequestsTasks,
      keyText(childId),
      Text.equal,
    );

    let allChildrenTasksFormatted = Option.get(allChildTasks, Trie.empty());

    let agnosticArchivedTaskList = Trie.toArray(allChildrenTasksFormatted, extractTasksReq);

    for (task in agnosticArchivedTaskList.vals()) {
      tasksRequestBuffer.add(task);
    };

    return tasksRequestBuffer.size();
  };

  // getTaskReqs function retrieves all task requests associated with a given child ID.
  // It's similar to getRewardReqs but operates on task requests.
  public shared (msg) func getTaskReqs(childId : Text) : async [Types.TaskRequest] {
    let tasksRequestBuffer : Buffer.Buffer<Types.TaskRequest> = Buffer.Buffer<Types.TaskRequest>(0);

    let allChildTasks = Trie.find(
      childRequestsTasks,
      keyText(childId),
      Text.equal,
    );

    let allChildrenTasksFormatted = Option.get(allChildTasks, Trie.empty());

    let agnosticArchivedTaskList = Trie.toArray(allChildrenTasksFormatted, extractTasksReq);

    for (task in agnosticArchivedTaskList.vals()) {
      tasksRequestBuffer.add(task);
    };

    return Buffer.toArray(tasksRequestBuffer);
  };

  // This function allows a child app to remove a specific task request.
  // It finds the child's task requests (Trie), removes the request identified by the ID,
  // and updates the child's Trie entry with the modified list. It then returns the request ID.
  public shared (msg) func removeTaskReq(childId : Text, id : Text) : async Text {
    // Find the child's task requests in the Trie
    let allChildTasks = Trie.find(
      childRequestsTasks,
      keyText(childId),
      Text.equal,
    );
    // Get the child's requests as an Option type (may be null)
    let allChildrenTaskormatted = Option.get(allChildTasks, Trie.empty());
    // Attempt to remove the task request identified by ID from the child's Trie
    let (allChildTasksLV2, oldLV2) = Trie.remove(
      allChildrenTaskormatted,
      keyText(id),
      Text.equal,
    );
    // Update the child's task requests in the main Trie with the modified list (or empty Trie if removed)
    let (allChildTasksUpdate, oldLV1) = Trie.put(
      childRequestsTasks,
      keyText(childId),
      Text.equal,
      allChildTasksLV2,
    );
    // Update the in-memory state of the childRequestsTasks Trie
    childRequestsTasks := allChildTasksUpdate;
    // Return the ID of the removed request
    return id;
  };

  // removeRewardReq function is similar to removeTaskReq but for reward requests.
  public shared (msg) func removeRewardReq(childId : Text, id : Text) : async Text {

    let allChildRewards = Trie.find(
      childRequestsRewards,
      keyText(childId),
      Text.equal,
    );

    let allChildrenRewardsFormatted = Option.get(allChildRewards, Trie.empty());

    let (allChildRewardssLV2, oldLV2) = Trie.remove(
      allChildrenRewardsFormatted,
      keyText(id),
      Text.equal,
    );

    let (allChildRewardsUpdate, oldLV1) = Trie.put(
      childRequestsRewards,
      keyText(childId),
      Text.equal,
      allChildRewardssLV2,
    );

    childRequestsRewards := allChildRewardsUpdate;

    return id;
  };

  // extractCallerFromId private function extracts the principal (caller ID) from a child ID string.
  // The child ID format is assumed to be "<principal ID>-<random string>".
  // It splits the string by "-", extracts the first part, and returns it.
  private func extractCallerFromId(childId : Text) : Text {
    // Split the child ID string by "-" delimiter
    let words = Text.split(childId, #char '-');
    // Convert the split parts to a Motoko array
    let wordsArray = Iter.toArray(words);
    // Extract a slice of the array containing all elements except the last one (random string)
    let wordsSlices = Array.slice<Text>(wordsArray, 0, wordsArray.size() -1);
    // Initialize an empty string to store the extracted principal ID
    var fromIter : Text = "";
    // Iterate through the sliced array (without the random string)
    var counter = 0;
    for (word in wordsSlices) {
      // If it's the first iteration, append the word (principal ID) to the empty string
      if (counter == 0) {
        fromIter := fromIter #word;
        counter := counter +1;
        // If it's not the first iteration, append "-" and the word (principal ID) to the string
      } else {
        fromIter := fromIter # "-" #word;
        counter := counter +1;
      };
    };
    // Return the extracted principal ID
    return fromIter;
  };

  // getChild function retrieves the name
  public shared (msg) func getChild(childId : Text) : async Text {
    let fromIter = extractCallerFromId(childId);
    let callerId = Principal.fromText(nullToText(?fromIter));
    let allChildren = Trie.find(
      profiles,
      keyPrincipal(callerId),
      Principal.equal,
    );
    let allChildrenFormatted = Option.get(allChildren, Trie.empty());
    let child = Trie.find(
      allChildrenFormatted,
      keyText(childId),
      Text.equal,
    );
    switch (child) {
      case null { return "" };
      case (?e) {
        return e.name;
      };
    };
  };
};
