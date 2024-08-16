import { type ReplaceBigInts, createSchema } from "@ponder/core"
import type { Address } from "viem"

export default createSchema((p) => ({
  AdminEvent: p.createTable(
    {
      id: p.string(),
      from: p.hex(),
      input: p.hex(),
      contractId: p.hex().references("Contract.id"),
      // Timestamps
      hash: p.hex(),
      logIndex: p.int(),
      blockNumber: p.bigint(),
      timestamp: p.int(),
    },
    {
      contractIndex: p.index("contractId"),
    },
  ),
  Balance: p.createTable(
    {
      id: p.string(), // Composite key of fan and collective
      fan: p.hex(),
      collective: p.hex(),
      fanVotes: p.bigint(), // Current balance of votes for this fan
      // Profit & loss
      totalBuyPrice: p.bigint(), // Cumulative amount spent on all purchases
      totalBuyVotes: p.bigint(), // Cumulative number of votes acquired
      totalSellPrice: p.bigint(), // Cumulative amount received from all sells
      totalSellVotes: p.bigint(), // Cumulative number of votes sold
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
      fanCollectiveIndex: p.index(["fan", "collective"]),
    },
  ),
  Collective: p.createTable(
    {
      id: p.hex(), // Collective address
      price: p.bigint(),
      fanCount: p.bigint(),
      voteCount: p.bigint(),
      burntVoteCount: p.bigint(),
      claimerVoteCount: p.bigint(),
      position: p.bigint().optional(),
      fanbase: p.string().optional(),
      contractId: p.hex().references("Contract.id"),
      treasuryValue: p.bigint(), // Multisig's balance of the stableCoin
      percentChange: p.float(), // Percent change in price in the last 24 hours
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
    id: p.hex(), // Contract address
    owner: p.hex(),
    stableCoin: p.hex(),
    claimerAccount: p.hex(),
    currentSeason: p.bigint(),
    curveDenominator: p.bigint(),
    txPaused: p.boolean(),
    // Fee structure
    poolPct: p.bigint(),
    collectivePct: p.bigint(),
    protocolPct: p.bigint(),
    protocolDestination: p.hex(),
    // Season now
    isDistributed: p.boolean(),
    isVerified: p.boolean(),
    startBlock: p.bigint(),
    endBlock: p.bigint(),
    prizePool: p.bigint(),
    distributedPool: p.bigint(),
    winningBreakdown: p.bigint().list(), // Basis points
    // Timestamps
    createdAt: p.int(),
    updatedAt: p.int(),
    lastEventId: p.string().references("Event.id"),
  }),
  EventType: p.createEnum(["buy", "sell", "redeem", "transfer", "unknown"]),
  Event: p.createTable(
    {
      id: p.string(),
      fanId: p.hex().references("Fan.id"), // Fan address
      collectiveId: p.hex().references("Collective.id"), // Collective address
      contractId: p.hex().references("Contract.id"), // Contract address
      eventType: p.enum("EventType"),
      // Vote information
      voteAmount: p.bigint(),
      fanVotes: p.bigint(),
      supply: p.bigint(),
      // Price information
      priceBase: p.bigint(),
      pricePoolFee: p.bigint(),
      priceProtocolFee: p.bigint(),
      priceCollectiveFee: p.bigint(),
      priceTotalFee: p.bigint(),
      priceTotal: p.bigint(),
      pricePerVote: p.bigint(),
      // Timestamps
      hash: p.hex(),
      logIndex: p.int(),
      blockNumber: p.bigint(),
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
    id: p.hex(), // Fan address
    eventCount: p.int(), // Number of events the fan has participated in
    contracts: p.hex().list(), // List of contract addresses the fan has used
    tokenBalances: p.json<ReplaceBigInts<{ [key: Address]: bigint }, string>>().optional(),
    // Timestamps
    createdAt: p.int(),
    updatedAt: p.int(),
    lastEventId: p.string().references("Event.id"),
  }),
}))
