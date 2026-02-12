import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Bool "mo:core/Bool";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";

actor {
  type Token = {
    name : Text;
    symbol : Text;
    decimals : Nat;
    totalSupply : Nat;
  };

  type Proposal = {
    id : Nat;
    title : Text;
    description : Text;
    amount : Nat;
    recipient : Principal;
    deadline : Time.Time;
    votesYes : Nat;
    votesNo : Nat;
    votesAbstain : Nat;
    executed : Bool;
    creator : Principal;
  };

  // Token metadata
  let token : Token = {
    name = "Wooden Spoon";
    symbol = "WSPN";
    decimals = 8;
    totalSupply = 1_000_000_000;
  };

  // Persistent data structures
  let balances = Map.empty<Principal, Nat>();
  let proposals = Map.empty<Nat, Proposal>();
  let proposalVotes = Map.empty<Nat, Set.Set<Principal>>();
  var proposalId = 0;
  var treasuryBalance = 0;

  public query ({ caller }) func getTokenInfo() : async Token {
    token;
  };

  public query ({ caller }) func getBalance(account : Principal) : async Nat {
    switch (balances.get(account)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func transfer(to : Principal, amount : Nat) : async Bool {
    if (amount <= 0) { Runtime.trap("Transfer amount must be positive") };

    let senderBalance = switch (balances.get(caller)) {
      case (null) { Runtime.trap("Insufficient balance") };
      case (?balance) { balance };
    };
    if (amount > senderBalance) { Runtime.trap("Insufficient balance") };

    balances.add(caller, senderBalance - amount);

    let recipientBalance = switch (balances.get(to)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
    balances.add(to, recipientBalance + amount);

    true;
  };

  public shared ({ caller }) func createProposal(title : Text, description : Text, amount : Nat, recipient : Principal, duration : Nat) : async Nat {
    if (amount <= 0) { Runtime.trap("Proposal amount must be positive") };
    if (amount > treasuryBalance) { Runtime.trap("Insufficient treasury balance") };
    if (duration <= 0) { Runtime.trap("Duration must be positive") };

    let proposal : Proposal = {
      id = proposalId;
      title;
      description;
      amount;
      recipient;
      deadline = Time.now() + duration;
      votesYes = 0;
      votesNo = 0;
      votesAbstain = 0;
      executed = false;
      creator = caller;
    };

    proposals.add(proposalId, proposal);
    proposalVotes.add(proposalId, Set.empty<Principal>());
    proposalId += 1;
    proposal.id;
  };

  public shared ({ caller }) func voteProposal(proposalId : Nat, vote : Text) : async () {
    let votesForProposal = switch (proposalVotes.get(proposalId)) {
      case (null) { Runtime.trap("The proposal does not exist!") };
      case (?votesForProposal) { votesForProposal };
    };
    if (votesForProposal.contains(caller)) { Runtime.trap("You have already voted for this proposal!") };

    let currentProposal = switch (proposals.get(proposalId)) {
      case (null) { Runtime.trap("The proposal does not exist") };
      case (?currentProposal) { currentProposal };
    };

    let voterBalance = switch (balances.get(caller)) {
      case (null) { Runtime.trap("No balance to vote") };
      case (?balance) { balance };
    };
    if (voterBalance <= 0) { Runtime.trap("Insufficient balance to vote") };
    if (Time.now() > currentProposal.deadline) {
      Runtime.trap("Voting period has ended");
    };

    let updatedProposal = switch (vote) {
      case ("yes") { { currentProposal with votesYes = currentProposal.votesYes + voterBalance } };
      case ("no") { { currentProposal with votesNo = currentProposal.votesNo + voterBalance } };
      case ("abstain") { { currentProposal with votesAbstain = currentProposal.votesAbstain + voterBalance } };
      case (_) { Runtime.trap("Invalid vote type") };
    };

    votesForProposal.add(caller);
    proposals.add(proposalId, updatedProposal);
    proposalVotes.add(proposalId, votesForProposal);
  };

  public shared ({ caller }) func finalizeProposal(proposalId : Nat) : async Bool {
    let currentProposal = switch (proposals.get(proposalId)) {
      case (null) { Runtime.trap("The proposal does not exist") };
      case (?currentProposal) { currentProposal };
    };

    if (Time.now() <= currentProposal.deadline) {
      Runtime.trap("Voting period has not ended yet");
    };

    let totalVotes = currentProposal.votesYes + currentProposal.votesNo + currentProposal.votesAbstain;
    if (totalVotes < token.totalSupply / 10) {
      Runtime.trap("Insufficient voting participation");
    };

    if (currentProposal.votesYes > currentProposal.votesNo and not currentProposal.executed) {
      treasuryBalance -= currentProposal.amount;
      proposals.add(
        proposalId,
        { currentProposal with executed = true },
      );
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getTreasuryBalance() : async Nat {
    treasuryBalance;
  };

  public query ({ caller }) func getProposal(proposalId : Nat) : async Proposal {
    switch (proposals.get(proposalId)) {
      case (null) { Runtime.trap("The proposal does not exist") };
      case (?proposal) { proposal };
    };
  };

  module Proposal {
    public func compare(proposal1 : Proposal, proposal2 : Proposal) : Order.Order {
      Nat.compare(proposal1.id, proposal2.id);
    };
  };

  public query ({ caller }) func getAllProposals() : async [Proposal] {
    proposals.values().toArray().sort();
  };
};
