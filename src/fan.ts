import type { Context } from "@/generated"
import type { UserEvent } from "@indexer/types"
import { getBlockTimestamp } from "@indexer/utils"
import { replaceBigInts } from "@ponder/core"
import { ERC20 } from "abis/ERC20"
import type { Address } from "viem"

async function readTokenBalance(context: Context, fan: Address, stableCoin: Address) {
  const result = await context.client.readContract({
    abi: ERC20,
    address: stableCoin,
    functionName: "balanceOf",
    args: [fan],
  })
  if (result === undefined || result === null) {
    console.warn(`WARN: Function call 'balanceOf' failed, token: ${stableCoin}, args: ${[fan]}`)
    return 0n
  }

  return result
}

export async function upsertFan(context: Context, event: UserEvent) {
  const timestamp = await getBlockTimestamp(context, event.transaction.blockNumber)
  const contractData = await context.db.Contract.findUnique({ id: event.log.address })
  if (!contractData) console.warn(`WARN: Contract not found, address: ${event.log.address}`)

  let tokenBalance = 0n
  if (contractData) tokenBalance = await readTokenBalance(context, event.args.fan, contractData.stableCoin)

  return await context.db.Fan.upsert({
    id: event.args.fan,
    create: {
      eventCount: 1,
      contracts: [event.log.address.toLowerCase() as Address],
      tokenBalances: replaceBigInts(
        {
          [contractData?.stableCoin as Address]: tokenBalance,
        },
        String,
      ),
      // Timestamps
      createdAt: timestamp,
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
    update: ({ current }) => ({
      eventCount: current.eventCount + 1,
      contracts: Array.from(new Set([...current.contracts, event.log.address.toLowerCase() as Address])),
      tokenBalances: replaceBigInts(
        {
          ...current.tokenBalances,
          [contractData?.stableCoin as Address]: tokenBalance,
        },
        String,
      ),
      // Timestamps
      updatedAt: timestamp,
      lastEventId: event.log.id,
    }),
  })
}
