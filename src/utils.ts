import type { UserEvent } from "@indexer/types"
import { type Address, formatUnits } from "viem"

export function getEventType(event: UserEvent) {
  if ("isBuy" in event.args && event.args.isBuy && event.args.fan === event.args.collective) return "collective"
  if ("isBuy" in event.args && event.args.isBuy) return "buy"
  if ("isBuy" in event.args && !event.args.isBuy) return "sell"
  if ("value" in event.args) return "redeem"
  if ("fanSender" in event.args) return "transfer"

  console.error(`ERROR: Unknown event type, log id: ${event.log.id}`)
  return "unknown"
}

export function formatPrice(value: bigint, decimals = 18) {
  return Number(formatUnits(value, decimals))
}

export function isUsdc(address: Address) {
  return ["0x62cC8c63Ef8563c2aE1Fad5A62702D4f430e53a3", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"].includes(address)
}
