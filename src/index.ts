import { ponder } from "@/generated"
import { createAdminEvent } from "@indexer/admin"
import { upsertBalance } from "@indexer/balance"
import { updateCollectiveAdmin, upsertCollective } from "@indexer/collective"
import { upsertContract, upsertContractAdmin } from "@indexer/contract"
import { createEvent } from "@indexer/event"
import { upsertFan } from "@indexer/fan"

// User contract events
ponder.on("BG_Beta:Trade", async ({ context, event }) => {
  await upsertContract(context, event)
  await upsertFan(context, event)
  await upsertCollective(context, event)
  await upsertBalance(context, event)

  const newEvent = await createEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:TransferVotes", async ({ context, event }) => {
  await upsertContract(context, event)
  await upsertFan(context, event)
  await upsertCollective(context, event)
  await upsertBalance(context, event)

  const newEvent = await createEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:Redeem", async ({ context, event }) => {
  await upsertContract(context, event)
  await upsertFan(context, event)
  await upsertCollective(context, event)
  await upsertBalance(context, event)

  const newEvent = await createEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

// Admin collective events
ponder.on("BG_Beta:DistributeCollectiveWinnings", async ({ context, event }) => {
  await upsertContractAdmin(context, event)
  await updateCollectiveAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:OraclewinPositionVerified", async ({ context, event }) => {
  await upsertContractAdmin(context, event)
  await updateCollectiveAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:SetCollectiveFanbase", async ({ context, event }) => {
  await upsertContractAdmin(context, event)
  await updateCollectiveAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

// Admin contract events
ponder.on("BG_Beta:DistributeSeason", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:IncreasePrizePool", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:Initialized", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:OracleWinningsVerified", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:OwnershipTransferred", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:Paused", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:RoleAdminChanged", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:RoleGranted", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})

ponder.on("BG_Beta:SetFeeStructure", async ({ context, event }) => {
  await upsertContractAdmin(context, event)

  const newEvent = await createAdminEvent(context, event)
  if (!newEvent) console.warn(`WARN: Event creation failed, log id: ${event.log.id}`)
})
