import { type ReplaceBigInts, createSchema } from "@ponder/core"
import type { Address } from "viem"

// TODO: Replace p.string() with p.hex() for addresses?
export default createSchema((p) => ({
  AdminEvent: p.createTable(
    {
      id: p.string(),
      from: p.string(), // Admin address
      input: p.string(), // Input data
      contractId: p.string().references("Contract.id"), // Contract address
      // Timestamps
      hash: p.string(), // Transaction hash
      logIndex: p.int(),
      blockNumber: p.int(),
      timestamp: p.int(),
    },
    {
      contractIndex: p.index("contractId"),
    },
  ),
  Balance: p.createTable(
    {
      id: p.string(), // Composite key of fan and collective
      fan: p.string(), // Fan address
      collective: p.string(), // Collective address
      fanVotes: p.int(), // Current balance of votes for this fan
      contractId: p.string().references("Contract.id"), // Contract address
      // Profit & loss
      totalBuyPrice: p.bigint(), // Cumulative amount spent on all purchases
      totalBuyVotes: p.int(), // Cumulative number of votes acquired
      totalSellPrice: p.bigint(), // Cumulative amount received from all sells
      totalSellVotes: p.int(), // Cumulative number of votes sold
      averageBuyPrice: p.bigint(), // Average price paid per vote across all purchases
      averageSellPrice: p.bigint(), // Average price received per vote across all sells
      realizedProfitLoss: p.bigint(), // Cumulative profit/loss from completed sell transactions
      // Timestamps
      createdAt: p.int(),
      updatedAt: p.int(),
      lastEventId: p.string().references("Event.id"),
    },
    {
      fanIndex: p.index("fan"),
      collectiveIndex: p.index("collective"),
      contractIndex: p.index("contractId"),
      fanCollectiveIndex: p.index(["fan", "collective"]),
    },
  ),
  Collective: p.createTable(
    {
      id: p.string(), // Collective address
      price: p.bigint(),
      fanCount: p.int(),
      voteCount: p.int(),
      burntVoteCount: p.int(),
      claimerVoteCount: p.int(),
      position: p.int().optional(),
      fanbase: p.string().optional(),
      contractId: p.string().references("Contract.id"), // Contract address
      treasuryValue: p.bigint(), // Multisig's balance of the stableCoin
      // Timestamps
      createdAt: p.int(),
      updatedAt: p.int(),
      lastEventId: p.string().references("Event.id"),
    },
    {
      contractIndex: p.index("contractId"),
    },
  ),
  Contract: p.createTable({
    id: p.string(), // Contract address
    owner: p.string(), // Owner address
    stableCoin: p.string(), // Stablecoin address
    claimerAccount: p.string(), // Claimer address
    currentSeason: p.int(),
    curveDenominator: p.int(),
    txPaused: p.boolean(),
    // Fee structure
    poolPct: p.int(),
    collectivePct: p.int(),
    protocolPct: p.int(),
    protocolDestination: p.string(), // Protocol address
    // Season now
    isDistributed: p.boolean(),
    isVerified: p.boolean(),
    startBlock: p.int(),
    endBlock: p.int(),
    prizePool: p.bigint(),
    distributedPool: p.bigint(),
    winningBreakdown: p.int().list(), // Basis points
    // Timestamps
    createdAt: p.int(),
    updatedAt: p.int(),
    lastEventId: p.string().references("Event.id"),
  }),
  EventType: p.createEnum(["buy", "sell", "redeem", "transfer", "collective", "unknown"]),
  Event: p.createTable(
    {
      id: p.string(),
      fanId: p.string().references("Fan.id"), // Fan address
      collectiveId: p.string().references("Collective.id"), // Collective address
      contractId: p.string().references("Contract.id"), // Contract address
      eventType: p.enum("EventType"),
      // Vote information
      voteAmount: p.int(),
      fanVotes: p.int(),
      supply: p.int(),
      // Price information
      priceBase: p.bigint(),
      pricePoolFee: p.bigint(),
      priceProtocolFee: p.bigint(),
      priceCollectiveFee: p.bigint(),
      priceTotalFee: p.bigint(),
      priceTotal: p.bigint(),
      pricePerVote: p.bigint(),
      // Timestamps
      hash: p.string(), // Transaction hash
      logIndex: p.int(),
      blockNumber: p.int(),
      timestamp: p.int(),
    },
    {
      fanIndex: p.index("fanId"),
      collectiveIndex: p.index("collectiveId"),
      contractIndex: p.index("contractId"),
      fanCollectiveIndex: p.index(["fanId", "collectiveId"]),
    },
  ),
  Fan: p.createTable({
    id: p.string(), // Fan address
    eventCount: p.int(), // Number of events the fan has participated in
    contracts: p.string().list(), // List of contract addresses the fan has used
    tokenBalances: p.json<ReplaceBigInts<{ [key: Address]: bigint }, string>>().optional(),
    // Timestamps
    createdAt: p.int(),
    updatedAt: p.int(),
    lastEventId: p.string().references("Event.id"),
  }),
}))
