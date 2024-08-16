import type { Context } from "@/generated"
import type { UserEvent } from "@indexer/types"
import { getBlockTimestamp, getEventType } from "@indexer/utils"

function getPriceAndAmount(event: UserEvent) {
  const eventType = getEventType(event)
  const { voteAmount } = event.args

  if (eventType === "buy" && "price" in event.args) return { price: event.args.price.total, voteAmount }
  if (eventType === "sell" && "price" in event.args) return { price: event.args.price.total, voteAmount }
  if (eventType === "redeem" && "value" in event.args) return { price: event.args.value, voteAmount }
  if (eventType === "transfer") return { price: 0n, voteAmount }

  console.warn(`WARN: Unknown event type, log id: ${event.log.id}`)
  return { price: 0n, voteAmount: 0n }
}

export async function upsertBalance(context: Context, event: UserEvent) {
  const eventType = getEventType(event)
  const timestamp = await getBlockTimestamp(context, event.transaction.blockNumber)
  const { fan, collective, fanVotes } = event.args

  // Derived values
  const isBuy = ["buy", "transfer"].includes(eventType)
  const { price, voteAmount } = getPriceAndAmount(event)

  return await context.db.Balance.upsert({
    id: `${fan}:${collective}`,
    create: {
      fan,
      collective,
      fanVotes,
      // Profit & loss
      totalBuyPrice: isBuy ? price : 0n,
      totalBuyVotes: isBuy ? voteAmount : 0n,
      totalSellPrice: isBuy ? 0n : price,
      totalSellVotes: isBuy ? 0n : voteAmount,
      averageBuyPrice: isBuy ? price / voteAmount : 0n,
      averageSellPrice: isBuy ? 0n : price / voteAmount,
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
        : current.realizedProfitLoss + (price - current.averageBuyPrice * voteAmount)

      return {
        fanVotes,
        // Profit & loss
        totalBuyPrice: totalBuyPrice,
        totalBuyVotes: totalBuyVotes,
        totalSellPrice: totalSellPrice,
        totalSellVotes: totalSellVotes,
        averageBuyPrice: totalBuyVotes > 0n ? totalBuyPrice / totalBuyVotes : 0n,
        averageSellPrice: totalSellVotes > 0n ? totalSellPrice / totalSellVotes : 0n,
        realizedProfitLoss,
        // Timestamps
        updatedAt: timestamp,
        lastEventId: event.log.id,
      }
    },
  })
}
