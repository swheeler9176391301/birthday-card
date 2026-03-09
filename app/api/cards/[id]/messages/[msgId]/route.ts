import { deleteMessage, editMessage, getCard } from "@/lib/store"
import { NextResponse } from "next/server"

type Params = { params: Promise<{ id: string; msgId: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const { id, msgId } = await params
  const card = await getCard(id)
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })
  await deleteMessage(id, msgId)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: Params) {
  const { id, msgId } = await params
  const card = await getCard(id)
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })
  const { text } = await req.json()
  if (!text || text.length > 500) return NextResponse.json({ error: "Invalid message" }, { status: 400 })
  await editMessage(id, msgId, text)
  return NextResponse.json({ ok: true })
}
