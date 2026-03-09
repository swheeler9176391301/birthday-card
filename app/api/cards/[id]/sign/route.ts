import { getCard, addMessage } from "@/lib/store"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = await getCard(id)
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })

  const { signer, text } = await req.json()
  if (!signer || !text) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  if (card.messages.length >= 100) return NextResponse.json({ error: "Card is full" }, { status: 400 })
  if (text.length > 500) return NextResponse.json({ error: "Message too long" }, { status: 400 })

  await addMessage(id, signer, text)
  return NextResponse.json({ ok: true })
}
