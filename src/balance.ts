import type { Context } from "@/generated"
import type { UserEvent } from "@indexer/types"
import { formatPrice, getEventType, isUsdc } from "@indexer/utils"
import type { Address } from "viem"

async function getPrice(context: Context, event: UserEvent) {
  const eventType = getEventType(event)
  const { stableCoin } = (await context.db.Contract.findUnique({ id: event.log.address })) ?? {}
  const decimals = isUsdc(stableCoin as Address) ? 6 : 18

  if (eventType === "buy" && "price" in event.args) return formatPrice(event.args.price.total, decimals)
  if (eventType === "sell" && "price" in event.args) return formatPrice(event.args.price.total, decimals)
  if (eventType === "redeem" && "value" in event.args) return formatPrice(event.args.value, decimals)
  if (eventType === "transfer") return 0

  console.warn(`WARN: Unknown event type, log id: ${event.log.id}`)
  return 0
}

export async function upsertBalance(context: Context, event: UserEvent) {
  const eventType = getEventType(event)
  // Do not track balance for collective events
  if (eventType === "collective") return

  const timestamp = Number(event.block.timestamp)
  const { fan, collective, fanVotes, voteAmount } = event.args

  // Derived values
  const isBuy = ["buy", "transfer"].includes(eventType)
  const price = await getPrice(context, event)

  return await context.db.Balance.upsert({
    id: `${fan}-${collective}`,
    create: {
      fan,
      collective,
      fanVotes: Number(fanVotes),
      // Profit & loss
      totalBuyPrice: isBuy ? price : 0,
      totalBuyVotes: isBuy ? Number(voteAmount) : 0,
      totalSellPrice: isBuy ? 0 : price,
      totalSellVotes: isBuy ? 0 : Number(voteAmount),
      averageBuyPrice: isBuy ? price / Number(voteAmount) : 0,
      averageSellPrice: isBuy ? 0 : price / Number(voteAmount),
      realizedProfitLoss: 0,
      // Timestamps
      createdAt: timestamp,
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
    update: ({ current }) => {
      const totalBuyPrice = isBuy ? current.totalBuyPrice + price : current.totalBuyPrice
      const totalBuyVotes = isBuy ? current.totalBuyVotes + Number(voteAmount) : current.totalBuyVotes
      const totalSellPrice = isBuy ? current.totalSellPrice : current.totalSellPrice + price
      const totalSellVotes = isBuy ? current.totalSellVotes : current.totalSellVotes + Number(voteAmount)

      // Calculate realized PnL
      const realizedProfitLoss = isBuy
        ? current.realizedProfitLoss
        : current.realizedProfitLoss + (price - current.averageBuyPrice * Number(voteAmount))

      return {
        fanVotes: Number(fanVotes),
        // Profit & loss
        totalBuyPrice: totalBuyPrice,
        totalBuyVotes: totalBuyVotes,
        totalSellPrice: totalSellPrice,
        totalSellVotes: totalSellVotes,
        averageBuyPrice: totalBuyVotes > 0 ? totalBuyPrice / totalBuyVotes : 0,
        averageSellPrice: totalSellVotes > 0 ? totalSellPrice / totalSellVotes : 0,
        realizedProfitLoss,
        // Timestamps
        updatedAt: timestamp,
        lastEventId: event.log.id,
      }
    },
  })
}
