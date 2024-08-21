import type { UserEvent } from "@indexer/types"

export function getEventType(event: UserEvent) {
  if ("isBuy" in event.args && event.args.isBuy && event.args.fan === event.args.collective) return "collective"
  if ("isBuy" in event.args && event.args.isBuy) return "buy"
  if ("isBuy" in event.args && !event.args.isBuy) return "sell"
  if ("value" in event.args) return "redeem"
  if ("fanSender" in event.args) return "transfer"

  console.error(`ERROR: Unknown event type, log id: ${event.log.id}`)
  return "unknown"
}
