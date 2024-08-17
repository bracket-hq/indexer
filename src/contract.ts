import type { Context } from "@/generated"
import type { AdminEvent, ContractMulticall, UserEvent } from "@indexer/types"
import type { Address } from "viem"

async function readContractMulticall(context: Context, address: Address) {
  const contract = {
    abi: context.contracts.BG_Beta.abi,
    address,
  } as const

  const [owner, stableCoin, claimerAccount, currentSeason, curveDenominator, txPaused, feeStructure, rawSeasonNow] =
    await context.client
      .multicall({
        contracts: [
          { ...contract, functionName: "owner" },
          { ...contract, functionName: "stableCoin" },
          { ...contract, functionName: "claimerAccount" },
          { ...contract, functionName: "currentSeason" },
          { ...contract, functionName: "curveDenominator" },
          { ...contract, functionName: "txPaused" },
          { ...contract, functionName: "feeStructure" },
          { ...contract, functionName: "seasonNow" },
        ] as const,
      })
      .then((results) => {
        return results.map((r, index) => {
          // Fallback for missing claimerAccount
          if (r.status !== "success" && index === 2) {
            return process.env.DEFAULT_CLAIMER as Address
          }
          // Fallback for missing curveDenominator, ncaab had a curve denominator of 420, all other early contracts had 100
          if (r.status !== "success" && index === 4) {
            return address === "0x1304BA4137e2C4B58fBfd1cE0BC07F4c3c6F35DA" ? 420n : 100n
          }
          return r.result
        }) as ContractMulticall
      })

  const [poolPct, collectivePct, protocolPct, protocolDestination] = feeStructure

  // NOTE: roundsN is not present in early contracts, so we ignore it
  const { roundsN, ...seasonNow } = rawSeasonNow ?? {}

  return {
    owner,
    stableCoin,
    claimerAccount,
    currentSeason,
    curveDenominator,
    txPaused,
    poolPct,
    collectivePct,
    protocolPct,
    protocolDestination,
    ...seasonNow,
  }
}

export async function upsertContract(context: Context, event: UserEvent | AdminEvent) {
  const timestamp = Number(event.block.timestamp)
  const contractData = await readContractMulticall(context, event.log.address)

  // TODO: Resolve error in seasonNow that causes contractData to be undefined
  // See: https://nilliworkspace.slack.com/archives/C066T49204E/p1723591481428739
  if (!contractData) {
    console.error(`ERROR: Contract multicall failed, address: ${event.log.address}`)
    return
  }
  if (!("isDistributed" in contractData)) {
    console.error(`ERROR: Function call 'seasonNow' failed, address: ${event.log.address}`)
    return
  }

  return await context.db.Contract.upsert({
    id: event.log.address,
    create: {
      ...contractData,
      // Timestamps
      createdAt: timestamp,
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
    update: {
      ...contractData,
      // Timestamps
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
  })
}
