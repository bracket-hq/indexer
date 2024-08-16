import type { Context } from "@/generated"
import type { UserEvent } from "@indexer/types"
import { hexToNumber, numberToHex } from "viem"

export async function getBlockTimestamp(context: Context, blockNumber: bigint) {
  const block = await context.client.request({
    method: "eth_getBlockByNumber",
    params: [numberToHex(blockNumber), false],
  })

  if (!block) {
    console.error(`ERROR: Block not found, blockNumber: ${blockNumber}`)
    return 0
  }
  return hexToNumber(block?.timestamp)
}

export function getEventType(event: UserEvent) {
  if ("isBuy" in event.args && event.args.isBuy) return "buy"
  if ("isBuy" in event.args && !event.args.isBuy) return "sell"
  if ("value" in event.args) return "redeem"
  if ("fanSender" in event.args) return "transfer"

  console.error(`ERROR: Unknown event type, log id: ${event.log.id}`)
  return "unknown"
}
