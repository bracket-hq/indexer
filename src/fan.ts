import type { Context } from "@/generated"
import type { UserEvent } from "@indexer/types"
import { ERC20 } from "abis/ERC20"
import type { Address } from "viem"

async function readTokenBalance(context: Context, fan: Address, stableCoin: Address) {
  try {
    const result = await context.client.readContract({
      abi: ERC20,
      address: stableCoin,
      functionName: "balanceOf",
      args: [fan],
    })

    return Number(result)
  } catch (error) {
    console.warn(`WARN: Function call 'balanceOf' failed, token: ${stableCoin}, args: ${[fan]}`)
    return 0
  }
}

export async function upsertFan(context: Context, event: UserEvent) {
  const timestamp = Number(event.block.timestamp)
  const contractData = await context.db.Contract.findUnique({ id: event.log.address })
  if (!contractData) console.warn(`WARN: Contract not found, address: ${event.log.address}`)

  let tokenBalance = 0
  if (contractData) tokenBalance = await readTokenBalance(context, event.args.fan, contractData.stableCoin as Address)

  return await context.db.Fan.upsert({
    id: event.args.fan,
    create: {
      eventCount: 1,
      contracts: [event.log.address.toLowerCase() as Address],
      tokenBalances: {
        [contractData?.stableCoin as Address]: tokenBalance,
      },
      // Timestamps
      createdAt: timestamp,
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
    update: ({ current }) => ({
      eventCount: current.eventCount + 1,
      contracts: Array.from(new Set([...current.contracts, event.log.address.toLowerCase() as Address])),
      tokenBalances: {
        ...current.tokenBalances,
        [contractData?.stableCoin as Address]: tokenBalance,
      },
      // Timestamps
      updatedAt: timestamp,
      lastEventId: event.log.id,
    }),
  })
}
