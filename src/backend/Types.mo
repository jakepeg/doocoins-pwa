import Trie "mo:base/Trie";
import Text "mo:base/Text";
module {
  public type Child = {
    name : Text;
    id : Text;
    archived : Bool;
  };

  public type ChildCall = {
    name : Text;
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
  };

  public type RewardRequest = {
    id : Text;
    childId : Text;
    reward : Nat;
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

  public type Profile = Trie.Trie<Principal, Trie.Trie<Text, Child>>;

  public type TaskMap = Trie.Trie<Text, Trie.Trie<Nat, Task>>;
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
