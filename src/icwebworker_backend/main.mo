import Principal "mo:base/Principal";
import Nat "mo:base/Nat";

actor {
  stable var counter = 0;

  public shared({caller}) func greet() : async Text {
    counter += 1;

    return "Hello, " # Principal.toText(caller) # ". Counter: " # Nat.toText(counter);
  };
};
