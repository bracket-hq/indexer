import type { Context } from "@/generated"
import type { EventType, UserEvent } from "@indexer/types"
import { formatPrice, getEventType, isUsdc } from "@indexer/utils"
import type { Address } from "viem"

async function getPrices(context: Context, event: UserEvent, eventType: EventType) {
  const { stableCoin } = (await context.db.Contract.findUnique({ id: event.log.address })) ?? {}
  const decimals = isUsdc(stableCoin as Address) ? 6 : 18

  const defaultPrices = {
    priceBase: 0,
    pricePoolFee: 0,
    priceProtocolFee: 0,
    priceCollectiveFee: 0,
    priceTotalFee: 0,
    priceTotal: 0,
    pricePerVote: 0,
  }

  if (["buy", "sell", "collective"].includes(eventType) && "price" in event.args) {
    return {
      priceBase: formatPrice(event.args.price.base, decimals),
      pricePoolFee: formatPrice(event.args.price.poolFee, decimals),
      priceProtocolFee: formatPrice(event.args.price.protocolFee, decimals),
      priceCollectiveFee: formatPrice(event.args.price.collectiveFee, decimals),
      priceTotalFee: formatPrice(event.args.price.totalFee, decimals),
      priceTotal: formatPrice(event.args.price.total, decimals),
      pricePerVote: formatPrice(event.args.price.perVote, decimals),
    }
  }
  if (eventType === "redeem" && "value" in event.args) {
    return {
      ...defaultPrices,
      priceBase: formatPrice(event.args.value, decimals),
      priceTotal: formatPrice(event.args.value, decimals),
    }
  }

  // Event types 'transfer' and 'unknown' have no price data
  return defaultPrices
}

export async function createEvent(context: Context, event: UserEvent) {
  const timestamp = Number(event.block.timestamp)
  const eventType = getEventType(event)

  const priceData = await getPrices(context, event, eventType)
  if (!priceData) {
    console.error(`ERROR: Unable to get prices for log id ${event.log.id}`)
    return
  }

  return await context.db.Event.create({
    id: event.log.id,
    data: {
      fanId: event.args.fan,
      collectiveId: event.args.collective,
      contractId: event.log.address,
      eventType,
      // Vote information
      voteAmount: Number(event.args.voteAmount),
      fanVotes: Number(event.args.fanVotes),
      supply: Number(event.args.supply),
      // Price information
      ...priceData,
      // Timestamps
      hash: event.transaction.hash,
      logIndex: event.log.logIndex,
      blockNumber: Number(event.transaction.blockNumber),
      timestamp,
    },
  })
}
