import type { Context } from "@/generated"
import type { AdminEvent } from "@indexer/types"

export async function createAdminEvent(context: Context, event: AdminEvent) {
  const timestamp = Number(event.block.timestamp)

  return await context.db.AdminEvent.create({
    id: event.log.id,
    data: {
      from: event.transaction.from,
      input: event.transaction.input,
      contractId: event.log.address,
      // Timestamps
      hash: event.transaction.hash,
      logIndex: event.log.logIndex,
      blockNumber: Number(event.transaction.blockNumber),
      timestamp,
    },
  })
}
