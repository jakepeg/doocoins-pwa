import Trie "mo:base/Trie";
import Text "mo:base/Text";
module {
  public type Child = {
    name : Text;
    id : Text;
    archived : Bool;
    parentIds : [Principal];  // Add this field to track multiple parents
  };

  public type ChildCall = {
    name : Text;
  };

  public type ParentChildRelation = {
    parentId : Principal;
    childId : Text;
    relationshipType : Text;  // e.g., "primary", "guardian", etc.
  };

  public type Task = {
    name : Text;
    value : Nat;
    id : Nat;
    archived : Bool;
  };

  public type TaskCall = {
    name : Text;
    value : Nat;
    id : Nat;
  };

  public type TaskRequest = {
    id : Text;
    childId : Text;
    taskId : Nat;
    name:Text;
    value:Nat;
  };

  public type RewardRequest = {
    id : Text;
    childId : Text;
    reward : Nat;
    value:Nat;
    name:Text;
  };

  public type Goal = {
    name : Text;
    value : Nat;
    id : Nat;
    archived : Bool;
  };

  public type GoalCall = {
    name : Text;
    value : Nat;

  };

  public type Transaction = {
    name : Text;
    value : Nat;
    completedDate : Text;
    transactionType : Text;
    id : Nat;
  };
  public type TransactionCall = {
    name : Text;
    value : Nat;
    completedDate : Text;
    transactionType : Text;

  };

  // public type Profile = Trie.Trie<Principal, Trie.Trie<Text, Child>>;

  public type Profile = {
      var children : Trie.Trie<Text, Child>;  // Store all children
      var parents : Trie.Trie<Principal, {name : Text; id : Principal}>;  // Store all parents
      var relationships : Trie.Trie<Text, [ParentChildRelation]>;  // Track parent-child relationships
  };

  // public type TaskMap = Trie.Trie<Text, Trie.Trie<Nat, Task>>;
  // TaskMap stores tasks and their assignments
  public type TaskMap = {
      var tasks : Trie.Trie<Nat, Task>;  // Store all tasks
      var childTasks : Trie.Trie<Text, [Nat]>;  // Map children to their tasks
      var parentTasks : Trie.Trie<Principal, [Nat]>;  // Map parents to tasks they created
  };
  public type GoalMap = Trie.Trie<Text, Trie.Trie<Nat, Goal>>;
  public type TransactionMap = Trie.Trie<Text, Trie.Trie<Nat, Transaction>>;
  public type TaskReqMap = Trie.Trie<Text, TaskRequest>;
  public type RewardReqMap = Trie.Trie<Text, RewardRequest>;

  public type Error = {
    //varients expected by result library
    #NotFound;
    #AlreadyExists;
    #NotAuthorized;
    #BalanceNotEnough;
  };

  public type Success = {
    #Success;
  };
};
