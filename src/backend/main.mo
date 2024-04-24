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

  //for mapping child's doocoins balance to child
  stable var childToBalance : Trie.Trie<Text, Nat> = Trie.empty();

  //for magicCode child app onboarding OTP
  stable var childPins : Trie.Trie<Text, Nat> = Trie.empty();
  stable var childIdsFromPin : Trie.Trie<Nat, Text> = Trie.empty();

  //who am I
  //----------------------------------------------------------------------------------------------------

  public shared query (msg) func whoami() : async Principal {
    msg.caller;
  };

  //magicCode child app onboarding OTP
  //----------------------------------------------------------------------------------------------------

  public shared (msg) func burnCode<system>(pin : Nat) : async Nat {
    Debug.print "in burn function!";
    let now = Time.now();
    let oneMinute = 1_000_000_000 * 60 * 1;
    let childId = Trie.find(
      childIdsFromPin,
      keyNat(pin),
      Nat.equal,
    );
    Debug.print "before setting timers after childID!";
    func burnCodeAsync() : async () {
      Debug.print "Starting the burn function!";
      Debug.print(debug_show (pin) # "     " #debug_show (childId)); // Often used with `debug_show` to convert values to Text

      let (newChildPins, oldPin) = Trie.remove(childPins, keyText(nullToText(childId)), Text.equal);
      let (newChildIdsFromPin, oldIds) = Trie.remove(childIdsFromPin, keyNat(pin), Nat.equal);
      childPins := newChildPins;
      childIdsFromPin := newChildIdsFromPin;
    };
    Debug.print("Setting timers!" #debug_show (Int.abs(now - oneMinute)));
    ignore setTimer<system>(
      #seconds(60 * 10), // 10 mins
      func() : async () {

        await burnCodeAsync();
      },
    );
    return pin;
  };

  func _randomPin() : async Nat {
    let fuzz = Fuzz.Fuzz();
    let randInt16 = fuzz.nat.randomRange(1111, 9999);
    return randInt16;
  };

  public shared (msg) func checkMagiCode(pin : Nat) : async ?Text {
    Debug.print("checking at the magic code");
    let childId = Trie.find(
      childIdsFromPin,
      keyNat(pin),
      Nat.equal,
    );
    if (childId != null) {
      return childId;
    };
    return ?"";
  };

  public shared (msg) func magicCode(childId : Text) : async ?Nat {
    let pinExists = Trie.find(
      childPins,
      keyText(childId),
      Text.equal,
    );
    if (pinExists != null) {
      return pinExists;
    };
    let pin : Nat = await _randomPin();
    let (newChildPins, oldPins) = Trie.put(
      childPins,
      keyText(childId),
      Text.equal,
      pin,
    );
    childPins := newChildPins;
    let childPinStore = Trie.find(
      childPins,
      keyText(childId),
      Text.equal,
    );
    let (childPinToId, childPinToOld) = Trie.put(
      childIdsFromPin,
      keyNat(pin),
      Nat.equal,
      childId,
    );

    childIdsFromPin := childPinToId;
    let burnt = await burnCode(nullToNat(childPinStore));
    return childPinStore;
  };

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

    //Initializing goal number to this child

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
    let callerId = msg.caller;
    let unArchivedChildsTasks : Buffer.Buffer<Types.Task> = Buffer.Buffer<Types.Task>(0);

    if (Principal.toText(callerId) == anonIdNew) {
      return #err(#NotAuthorized);
    };

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

  //Claim childs goal
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
};
