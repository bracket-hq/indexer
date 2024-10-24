import type { Context } from "@/generated"
import type { AdminEvent, ContractData, ContractMulticall, SeasonNow, UserEvent } from "@indexer/types"
import type { Address } from "viem"

// TODO: Resolve error in seasonNow that causes contractData to be undefined
// See: https://nilliworkspace.slack.com/archives/C066T49204E/p1723591481428739
async function readSeasonNow(context: Context, address: Address) {
  try {
    const result = (await context.client.readContract({
      abi: context.contracts.BG_Beta.abi,
      address,
      functionName: "seasonNow",
    })) as SeasonNow

    // NOTE: roundsN is not present in early contracts, so we ignore it
    const { isDistributed, isVerified, startBlock, endBlock, prizePool, distributedPool, winningBreakdown } = result

    return {
      isDistributed,
      isVerified,
      startBlock: Number(startBlock),
      endBlock: Number(endBlock),
      prizePool,
      distributedPool,
      winningBreakdown: winningBreakdown.map(Number),
    }
  } catch (error) {
    console.error(`ERROR: Function call 'seasonNow' failed, address: ${address}`)
    return
  }
}

async function readContractMulticall(context: Context, address: Address) {
  try {
    const contract = {
      abi: context.contracts.BG_Beta.abi,
      address,
    } as const

    const [owner, stableCoin, claimerAccount, currentSeason, curveDenominator, txPaused, feeStructure, seasonNow] =
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
    const { isDistributed, isVerified, startBlock, endBlock, prizePool, distributedPool, winningBreakdown } = seasonNow

    return {
      owner,
      stableCoin,
      claimerAccount,
      currentSeason: Number(currentSeason),
      curveDenominator: Number(curveDenominator),
      txPaused,
      poolPct: Number(poolPct),
      collectivePct: Number(collectivePct),
      protocolPct: Number(protocolPct),
      protocolDestination,
      isDistributed,
      isVerified,
      startBlock: Number(startBlock),
      endBlock: Number(endBlock),
      prizePool,
      distributedPool,
      winningBreakdown: winningBreakdown.map(Number),
    }
  } catch (error) {
    console.error(`ERROR: Contract multicall failed, address: ${address}`)
    return
  }
}

export async function upsertContract(context: Context, event: UserEvent | AdminEvent) {
  const timestamp = Number(event.block.timestamp)
  const contract = await context.db.Contract.findUnique({ id: event.log.address })

  const contractData = contract
    ? await readSeasonNow(context, event.log.address)
    : await readContractMulticall(context, event.log.address)

  if (!contractData) {
    console.error(`ERROR: contractData is undefined, log id: ${event.log.id}`)
    return
  }

  return await context.db.Contract.upsert({
    id: event.log.address,
    create: {
      ...(contractData as ContractData),
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

export async function upsertContractAdmin(context: Context, event: AdminEvent) {
  const timestamp = Number(event.block.timestamp)
  const contractData = await readContractMulticall(context, event.log.address)

  if (!contractData) {
    console.error(`ERROR: contractData is undefined, log id: ${event.log.id}`)
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
