import type { Context } from "@/generated"
import type { UserEvent } from "@indexer/types"
import { getEventType } from "@indexer/utils"

function getPrice(event: UserEvent) {
  const eventType = getEventType(event)

  if (eventType === "buy" && "price" in event.args) return event.args.price.total
  if (eventType === "sell" && "price" in event.args) return event.args.price.total
  if (eventType === "redeem" && "value" in event.args) return event.args.value
  if (eventType === "transfer") return 0n

  console.warn(`WARN: Unknown event type, log id: ${event.log.id}`)
  return 0n
}

export async function upsertBalance(context: Context, event: UserEvent) {
  const eventType = getEventType(event)
  // Do not track balance for collective events
  if (eventType === "collective") return

  const timestamp = Number(event.block.timestamp)
  const { fan, collective } = event.args
  const fanVotes = Number(event.args.fanVotes)
  const voteAmount = Number(event.args.voteAmount)

  // Derived values
  const isBuy = ["buy", "transfer"].includes(eventType)
  const price = getPrice(event)

  return await context.db.Balance.upsert({
    id: `${fan}-${collective}`,
    create: {
      fan,
      collective,
      fanVotes,
      contractId: event.log.address,
      // Profit & loss
      totalBuyPrice: isBuy ? price : 0n,
      totalBuyVotes: isBuy ? voteAmount : 0,
      totalSellPrice: isBuy ? 0n : price,
      totalSellVotes: isBuy ? 0 : voteAmount,
      averageBuyPrice: isBuy ? price / BigInt(voteAmount) : 0n,
      averageSellPrice: isBuy ? 0n : price / BigInt(voteAmount),
      realizedProfitLoss: 0n,
      // Timestamps
      createdAt: timestamp,
      updatedAt: timestamp,
      lastEventId: event.log.id,
    },
    update: ({ current }) => {
      const totalBuyPrice = isBuy ? current.totalBuyPrice + price : current.totalBuyPrice
      const totalBuyVotes = isBuy ? current.totalBuyVotes + voteAmount : current.totalBuyVotes
      const totalSellPrice = isBuy ? current.totalSellPrice : current.totalSellPrice + price
      const totalSellVotes = isBuy ? current.totalSellVotes : current.totalSellVotes + voteAmount

      // Calculate realized PnL
      const realizedProfitLoss = isBuy
        ? current.realizedProfitLoss
        : current.realizedProfitLoss + (price - current.averageBuyPrice * BigInt(voteAmount))

      return {
        fanVotes,
        // Profit & loss
        totalBuyPrice: totalBuyPrice,
        totalBuyVotes: totalBuyVotes,
        totalSellPrice: totalSellPrice,
        totalSellVotes: totalSellVotes,
        averageBuyPrice: totalBuyVotes > 0n ? totalBuyPrice / BigInt(totalBuyVotes) : 0n,
        averageSellPrice: totalSellVotes > 0n ? totalSellPrice / BigInt(totalSellVotes) : 0n,
        realizedProfitLoss,
        // Timestamps
        updatedAt: timestamp,
        lastEventId: event.log.id,
      }
    },
  })
}
