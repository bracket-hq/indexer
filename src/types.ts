import type { Event } from "@/generated"
import type { Address } from "viem"

type FeeStructure = [bigint, bigint, bigint, Address]
export type SeasonNow = {
  isDistributed: boolean
  isVerified: boolean
  startBlock: bigint
  endBlock: bigint
  prizePool: bigint
  distributedPool: bigint
  winningBreakdown: bigint[]
  roundsN?: bigint
}
export type ContractMulticall = [Address, Address, Address, bigint, bigint, boolean, FeeStructure, SeasonNow]

export type UserEvent = Event<"BG_Beta:Trade"> | Event<"BG_Beta:TransferVotes"> | Event<"BG_Beta:Redeem">
export type AdminEvent =
  | Event<"BG_Beta:DistributeCollectiveWinnings">
  | Event<"BG_Beta:DistributeSeason">
  | Event<"BG_Beta:IncreasePrizePool">
  | Event<"BG_Beta:Initialized">
  | Event<"BG_Beta:OracleWinningsVerified">
  | Event<"BG_Beta:OraclewinPositionVerified">
  | Event<"BG_Beta:OwnershipTransferred">
  | Event<"BG_Beta:Paused">
  | Event<"BG_Beta:RoleAdminChanged">
  | Event<"BG_Beta:RoleGranted">
  | Event<"BG_Beta:SetCollectiveFanbase">
  | Event<"BG_Beta:SetFeeStructure">
