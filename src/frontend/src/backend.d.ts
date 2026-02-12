import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Token {
    decimals: bigint;
    name: string;
    totalSupply: bigint;
    symbol: string;
}
export type Time = bigint;
export interface Proposal {
    id: bigint;
    title: string;
    creator: Principal;
    votesYes: bigint;
    recipient: Principal;
    description: string;
    deadline: Time;
    votesAbstain: bigint;
    votesNo: bigint;
    executed: boolean;
    amount: bigint;
}
export interface backendInterface {
    createProposal(title: string, description: string, amount: bigint, recipient: Principal, duration: bigint): Promise<bigint>;
    finalizeProposal(proposalId: bigint): Promise<boolean>;
    getAllProposals(): Promise<Array<Proposal>>;
    getBalance(account: Principal): Promise<bigint>;
    getProposal(proposalId: bigint): Promise<Proposal>;
    getTokenInfo(): Promise<Token>;
    getTreasuryBalance(): Promise<bigint>;
    transfer(to: Principal, amount: bigint): Promise<boolean>;
    voteProposal(proposalId: bigint, vote: string): Promise<void>;
}
