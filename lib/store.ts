import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

type Message = { id: string; signer: string; text: string }
export type Card = { recipientName: string; messages: Message[] }

// --- Local file store (used when running on your computer) ---

const DB_PATH = join(process.cwd(), "cards.json")

function localLoad(): Record<string, Card> {
  if (!existsSync(DB_PATH)) return {}
  return JSON.parse(readFileSync(DB_PATH, "utf-8"))
}

function localSave(data: Record<string, Card>) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// --- Upstash Redis store (used when deployed) ---

const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN
const isDeployed = !!KV_URL && !!KV_TOKEN

async function kvGet(key: string): Promise<Card | null> {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  })
  const { result } = await res.json()
  return result ? JSON.parse(result) : null
}

async function kvSet(key: string, card: Card) {
  await fetch(`${KV_URL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", key, JSON.stringify(card)]),
  })
}

// --- Public API ---

export async function getCard(id: string): Promise<Card | undefined> {
  if (isDeployed) return (await kvGet(id)) ?? undefined
  return localLoad()[id]
}

export async function createCard(id: string, recipientName: string) {
  const card: Card = { recipientName, messages: [] }
  if (isDeployed) {
    await kvSet(id, card)
  } else {
    const data = localLoad()
    data[id] = card
    localSave(data)
  }
}

export async function addMessage(id: string, signer: string, text: string) {
  const msgId = Math.random().toString(36).slice(2, 9)
  if (isDeployed) {
    const card = await kvGet(id)
    if (!card) return
    card.messages.push({ id: msgId, signer, text })
    await kvSet(id, card)
  } else {
    const data = localLoad()
    data[id].messages.push({ id: msgId, signer, text })
    localSave(data)
  }
}

export async function deleteMessage(cardId: string, msgId: string) {
  if (isDeployed) {
    const card = await kvGet(cardId)
    if (!card) return
    card.messages = card.messages.filter((m) => m.id !== msgId)
    await kvSet(cardId, card)
  } else {
    const data = localLoad()
    data[cardId].messages = data[cardId].messages.filter((m) => m.id !== msgId)
    localSave(data)
  }
}

export async function editMessage(cardId: string, msgId: string, text: string) {
  if (isDeployed) {
    const card = await kvGet(cardId)
    if (!card) return
    const msg = card.messages.find((m) => m.id === msgId)
    if (msg) msg.text = text
    await kvSet(cardId, card)
  } else {
    const data = localLoad()
    const msg = data[cardId].messages.find((m) => m.id === msgId)
    if (msg) msg.text = text
    localSave(data)
  }
}
