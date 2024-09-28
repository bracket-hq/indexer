import type { Context, Event } from "@/generated"
import type { UserEvent } from "@indexer/types"
import { ERC20 } from "abis/ERC20"
import type { Address } from "viem"

// const ONE_DAY_OF_BLOCKS = 43_200
const THIRTY_MINUTES_OF_BLOCKS = 900

async function readCollectiveVotes(context: Context, contract: Address, collective: Address) {
  try {
    const result = await context.client.readContract({
      abi: context.contracts.BG_Beta.abi,
      address: contract,
      functionName: "collectives",
      args: [collective],
    })

    return {
      name: result[0],
      voteCount: Number(result[1]),
      burntVoteCount: Number(result[2]),
    }
  } catch (error) {
    console.warn(`WARN: Function call 'collectives' failed, contract: ${contract}, args: ${[collective]}`)
    return { name: "", voteCount: 0, burntVoteCount: 0 }
  }
}

async function readClaimerVotes(context: Context, contract: Address, collective: Address) {
  const { claimerAccount } = (await context.db.Contract.findUnique({ id: contract })) ?? {
    claimerAccount: process.env.DEFAULT_CLAIMER,
  }
  if (!claimerAccount) throw new Error("claimerAccount is undefined, is the environment variable set?")

  try {
    const result = await context.client.readContract({
      abi: context.contracts.BG_Beta.abi,
      address: contract,
      functionName: "balanceOf",
      args: [claimerAccount as Address, collective],
    })

    return Number(result)
  } catch (error) {
    console.warn(`WARN: Function call 'balanceOf' failed, contract: ${contract}, args: ${[claimerAccount, collective]}`)
    return 0
  }
}

async function readTreasuryValue(context: Context, token: Address, collective: Address) {
  try {
    const result = await context.client.readContract({
      abi: ERC20,
      address: token,
      functionName: "balanceOf",
      args: [collective],
    })

    return result
  } catch (error) {
    console.warn(`WARN: Function call 'balanceOf' failed, token: ${token}, args: ${[collective]}`)
    return 0n
  }
}

function getPrice(event: UserEvent) {
  if ("price" in event.args && "perVote" in event.args.price) return event.args.price.perVote
  return undefined
}

function getPosition(
  event:
    | Event<"BG_Beta:DistributeCollectiveWinnings">
    | Event<"BG_Beta:OraclewinPositionVerified">
    | Event<"BG_Beta:SetCollectiveFanbase">,
) {
  if ("exitRound" in event.args) return Number(event.args.exitRound)
  if ("round" in event.args) return Number(event.args.round)
  return undefined
}

export async function upsertCollective(context: Context, event: UserEvent) {
  const timestamp = Number(event.block.timestamp)
  const contractData = await context.db.Contract.findUnique({ id: event.log.address })
  if (!contractData) console.warn(`WARN: Contract not found, address: ${event.log.address}`)

  // Onchain data
  const { voteCount, burntVoteCount } = await readCollectiveVotes(context, event.log.address, event.args.collective)
  const claimerVoteCount = await readClaimerVotes(context, event.log.address, event.args.collective)

  let treasuryValue = 0n
  if (contractData)
    treasuryValue = await readTreasuryValue(context, contractData.stableCoin as Address, event.args.collective)

  // Derived values
  const newPrice = getPrice(event)
  const fanBalance = await context.db.Balance.findUnique({
    id: `${event.args.fan}-${event.args.collective}`,
  })

  return await context.db.Collective.upsert({
    id: event.args.collective,
    create: {
      price: newPrice ?? 0n,
      fanCount: 0,
      voteCount: 1,
      burntVoteCount: 0,
      claimerVoteCount: 0,
      treasuryValue: 0n,
      contractId: event.log.address,
      // Timestamps
      createdAt: timestamp,
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
    update: ({ current }) => ({
      price: newPrice ?? current.price,
      fanCount: current.fanCount + (!fanBalance ? 1 : event.args.fanVotes === 0n ? -1 : 0),
      voteCount,
      burntVoteCount,
      claimerVoteCount,
      treasuryValue,
      contractId: event.log.address,
      // Timestamps
      updatedAt: timestamp,
      lastEventId: event.log.id,
    }),
  })
}

export async function updateCollectiveAdmin(
  context: Context,
  event:
    | Event<"BG_Beta:DistributeCollectiveWinnings">
    | Event<"BG_Beta:OraclewinPositionVerified">
    | Event<"BG_Beta:SetCollectiveFanbase">,
) {
  const timestamp = Number(event.block.timestamp)
  const contractData = await context.db.Contract.findUnique({ id: event.log.address })
  if (!contractData) console.warn(`WARN: Contract not found, address: ${event.log.address}`)

  // Onchain data
  const { voteCount, burntVoteCount } = await readCollectiveVotes(context, event.log.address, event.args.collective)
  const claimerVoteCount = await readClaimerVotes(context, event.log.address, event.args.collective)

  let treasuryValue = 0n
  if (contractData)
    treasuryValue = await readTreasuryValue(context, contractData.stableCoin as Address, event.args.collective)

  // Derived values
  const position = getPosition(event)
  const fanbase = "fanbase" in event.args ? event.args.fanbase : undefined

  return await context.db.Collective.upsert({
    id: event.args.collective,
    create: {
      price: 0n,
      fanCount: 0,
      voteCount: 1,
      burntVoteCount: 0,
      claimerVoteCount: 0,
      treasuryValue: 0n,
      contractId: event.log.address,
      // Timestamps
      createdAt: timestamp,
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
    update: {
      voteCount,
      burntVoteCount,
      claimerVoteCount,
      position,
      fanbase,
      treasuryValue,
      // Timestamps
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
  })
}
